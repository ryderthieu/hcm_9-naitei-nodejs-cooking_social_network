import React from "react";
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/outline";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertPopupProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm?: () => void;
	type?: AlertType;
	title?: string;
	message: string;
	confirmText?: string;
	showCancel?: boolean;
	cancelText?: string;
}

const typeStyles: Record<AlertType, { bg: string; iconColor: string; title: string }> = {
	success: { bg: "bg-green-100", iconColor: "text-green-600", title: "Thành công" },
	error: { bg: "bg-red-100", iconColor: "text-red-600", title: "Lỗi" },
	warning: { bg: "bg-yellow-100", iconColor: "text-yellow-600", title: "Cảnh báo" },
	info: { bg: "bg-blue-100", iconColor: "text-blue-600", title: "Thông báo" },
};

const renderIcon = (type: AlertType) => {
	const common = "w-6 h-6";
	if (type === "success") return <CheckCircleIcon className={`${common} ${typeStyles.success.iconColor}`} />;
	if (type === "error") return <ExclamationTriangleIcon className={`${common} ${typeStyles.error.iconColor}`} />;
	if (type === "warning") return <ExclamationTriangleIcon className={`${common} ${typeStyles.warning.iconColor}`} />;
	return <InformationCircleIcon className={`${common} ${typeStyles.info.iconColor}`} />;
};

const AlertPopup: React.FC<AlertPopupProps> = ({
	isOpen,
	onClose,
	onConfirm,
	type = "info",
	title,
	message,
	confirmText = "Xác nhận",
	showCancel = false,
	cancelText = "Hủy",
}) => {
	if (!isOpen) return null;

	const style = typeStyles[type];

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className={`w-10 h-10 ${style.bg} rounded-full flex items-center justify-center`}>
								{renderIcon(type)}
							</div>
							<h2 className="text-xl font-bold text-gray-800">{title || style.title}</h2>
						</div>
						<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
							<span className="sr-only">Close</span>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500">
								<path fillRule="evenodd" d="M10 8.586 4.293 2.879a1 1 0 1 0-1.414 1.414L8.586 10l-5.707 5.707a1 1 0 0 0 1.414 1.414L10 11.414l5.707 5.707a1 1 0 0 0 1.414-1.414L11.414 10l5.707-5.707a1 1 0 1 0-1.414-1.414L10 8.586Z" clipRule="evenodd" />
							</svg>
						</button>
					</div>

					<div className="mb-8">
						<p className="text-gray-600 leading-relaxed whitespace-pre-line">{message}</p>
					</div>

					<div className="flex justify-end gap-3">
						{showCancel && (
							<button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
								{cancelText}
							</button>
						)}
						<button
							onClick={() => {
								if (onConfirm) onConfirm();
								onClose();
							}}
							className="px-6 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium"
						>
							{confirmText}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AlertPopup;
