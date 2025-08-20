import { useEffect, useMemo, useState } from "react";
import { getFollowers, getFollowings, getUserByUsername } from "../../services/user.service";
import UserHeader from "../common/user/UserHeader";
import { showErrorAlert } from "../../utils/utils";
import { useAuth } from "../../contexts/AuthContext";

type ListType = "followers" | "following";

interface FollowersPopupProps {
	isOpen: boolean;
	onClose: () => void;
	username: string;
	type: ListType;
}

interface PopupUserItem {
	id: number;
	firstName: string;
	lastName: string;
	avatar: string | null;
	username?: string;
	isFollowing?: boolean;
}

export default function FollowersPopup({ isOpen, onClose, username, type }: FollowersPopupProps) {
	const [users, setUsers] = useState<PopupUserItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState("");
    const { user: currentUser } = useAuth();

	useEffect(() => {
		if (!isOpen || !username) return;
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const data = type === "followers" ? await getFollowers(username) : await getFollowings(username);
				if (!mounted) return;
				const baseUsers: PopupUserItem[] = (Array.isArray(data) ? data : data?.users || []) as any;
				setUsers(baseUsers);

				const needEnrich = baseUsers.some(u => typeof u.isFollowing === "undefined") && Boolean(currentUser?.id);
				if (needEnrich) {
					const enriched = await Promise.all(
						baseUsers.map(async (u) => {
							if (!u.username || typeof u.isFollowing !== "undefined") return u;
							try {
								const info = await getUserByUsername(u.username);
								return { ...u, isFollowing: Boolean(info?.isFollowing) } as PopupUserItem;
							} catch {
								return u;
							}
						})
					);
					if (!mounted) return;
					setUsers(enriched as PopupUserItem[]);
				}
			} catch (error) {
				showErrorAlert(error, "Không thể tải danh sách. Vui lòng thử lại!");
				setUsers([]);
			} finally {
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [isOpen, username, type]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return users;
		return users.filter(u =>
			`${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(q) ||
			(u.username || "").toLowerCase().includes(q)
		);
	}, [users, query]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="fixed inset-0" onClick={onClose}></div>
			<div
				className="bg-white rounded-2xl shadow-xl w-full max-w-md relative border border-yellow-600/10 overflow-hidden"
				style={{ animation: "popup 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
			>
				<button
					className="absolute top-4 right-4 p-2 text-gray-400 hover:text-yellow-600 hover:scale-110 transition-all duration-300"
					onClick={onClose}
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div className="p-6">
					<h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
						{type === "followers" ? "Người theo dõi" : "Đang theo dõi"}
						<span className="inline-flex items-center justify-center text-sm font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
							{users.length}
						</span>
					</h3>
					<div className="relative mb-4">
						<svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							placeholder="Tìm kiếm..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:bg-white transition-all"
						/>
					</div>

					<div className="max-h-80 overflow-y-auto divide-y">
						{loading ? (
							<div className="py-8 text-center text-gray-500">Đang tải...</div>
						) : filtered.length === 0 ? (
							<div className="py-8 text-center text-gray-500">Không có dữ liệu</div>
						) : (
							filtered.map((u) => (
								<div key={u.id} className="p-3 hover:bg-yellow-50 rounded-xl transition-all duration-200">
									<UserHeader
										user={u as any}
										size="md"
										showTimestamp={false}
										showUsername={true}
										showFollowButton={true}
										isFollowing={Boolean(u.isFollowing)}
										currentUserId={currentUser?.id}
										className="w-full"
									/>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}


