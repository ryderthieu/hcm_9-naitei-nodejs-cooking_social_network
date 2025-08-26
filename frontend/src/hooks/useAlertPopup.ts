import { useState, useCallback } from "react";

type AlertType = "success" | "error" | "warning" | "info";

export interface AlertState {
	isOpen: boolean;
	type: AlertType;
	title?: string;
	message: string;
	confirmText?: string;
	showCancel?: boolean;
	cancelText?: string;
	onConfirm?: () => void;
}

const defaultState: AlertState = {
	isOpen: false,
	type: "info",
	message: "",
};

export function useAlertPopup() {
	const [alert, setAlert] = useState<AlertState>(defaultState);

	const closeAlert = useCallback(() => setAlert((p) => ({ ...p, isOpen: false })), []);

	const show = useCallback(
		(config: Partial<AlertState> & { message: string }) => {
			setAlert({
				isOpen: true,
				type: config.type || "info",
				title: config.title,
				message: config.message,
				confirmText: config.confirmText,
				showCancel: config.showCancel,
				cancelText: config.cancelText,
				onConfirm: config.onConfirm,
			});
		},
		[]
	);

	const showSuccess = useCallback(
		(message: string, opts?: Partial<AlertState>) =>
			show({ ...opts, type: "success", message }),
		[show]
	);

	const showError = useCallback(
		(message: string, opts?: Partial<AlertState>) => show({ ...opts, type: "error", message }),
		[show]
	);

	const showWarning = useCallback(
		(message: string, opts?: Partial<AlertState>) => show({ ...opts, type: "warning", message }),
		[show]
	);

	const showInfo = useCallback(
		(message: string, opts?: Partial<AlertState>) => show({ ...opts, type: "info", message }),
		[show]
	);

	return { alert, showSuccess, showError, showWarning, showInfo, closeAlert, show };
}
