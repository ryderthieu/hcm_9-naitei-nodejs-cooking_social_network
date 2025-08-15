import { useState, useEffect, useCallback } from "react";
import { searchUsers } from "../../services/user.service";
import { showErrorAlert } from "../../utils/utils";

interface SharePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onShareToUser: (userId: number) => void;
    onShareToSocial: (platform: string) => void;
    postCaption?: string;
    postId: number;
}

export default function SharePopup({
    isOpen,
    onClose,
    onShareToUser,
    onShareToSocial,
    postCaption = "",
    postId,
}: SharePopupProps) {
    const [activeTab, setActiveTab] = useState<'social' | 'messages'>('social');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: number;
            return (query: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    if (query.trim().length < 2) {
                        setSearchResults([]);
                        return;
                    }

                    setIsSearching(true);
                    try {
                        const users = await searchUsers(query);
                        setSearchResults(users);
                    } catch (error) {
                        showErrorAlert(error, "Không thể tìm kiếm người dùng. Vui lòng thử lại!");
                        setSearchResults([]);
                    } finally {
                        setIsSearching(false);
                    }
                }, 300);
            };
        })(),
        []
    );

    const handleSearchUsers = (query: string) => {
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleShareToSocial = (platform: string) => {
        onShareToSocial(platform);
    };

    const handleShareToUser = (userId: number) => {
        onShareToUser(userId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className="fixed inset-0"
                onClick={onClose}
            ></div>
            <div
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative border border-yellow-600/10"
                style={{
                    animation: 'popup 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <button
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-yellow-600 hover:scale-110 transition-all duration-300"
                    onClick={onClose}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    Chia sẻ bài viết
                </h3>

                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                    <button
                        onClick={() => setActiveTab('social')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'social'
                            ? 'bg-white text-yellow-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Mạng xã hội
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'messages'
                            ? 'bg-white text-yellow-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Tin nhắn
                    </button>
                </div>

                {activeTab === 'social' ? (
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleShareToSocial('copy')}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
                        >
                            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span>Copy link</span>
                        </button>

                        <button
                            onClick={() => handleShareToSocial('facebook')}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
                        >
                            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <span>Chia sẻ Facebook</span>
                        </button>

                        <button
                            onClick={() => handleShareToSocial('twitter')}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
                        >
                            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </div>
                            <span>Chia sẻ Twitter</span>
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="relative mb-4">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Tìm kiếm cuộc trò chuyện..."
                                value={searchQuery}
                                onChange={(e) => handleSearchUsers(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:bg-white transition-all"
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                            {isSearching ? (
                                <div className="text-center py-8 text-gray-500">
                                    Đang tìm kiếm...
                                </div>
                            ) : (searchResults && searchResults.length > 0) ? (
                                searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleShareToUser(user.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-all duration-300 group"
                                    >
                                        <img
                                            src={user.avatar || "/src/assets/avatar-default.svg"}
                                            alt=""
                                            className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-yellow-600 transition-all"
                                        />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium text-gray-800">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                @{user.username}
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                ))
                            ) : (searchQuery && searchQuery.length >= 2) ? (
                                <div className="text-center py-8 text-gray-500">
                                    Không tìm thấy người dùng
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Nhập tên người dùng để tìm kiếm
                                </div>
                            )}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
