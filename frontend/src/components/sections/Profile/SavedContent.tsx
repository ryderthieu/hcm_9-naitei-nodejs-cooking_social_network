import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { getSavedPosts } from "../../../services/post.service";
import { Post } from "../../Post";
import type { PostEntity } from "../../../types/post.type";

interface SavedContentProps {
  username: string;
}

export default function SavedContent({ username }: SavedContentProps) {
  const [savedPosts, setSavedPosts] = useState<PostEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        const postsData = await getSavedPosts(username);
        setSavedPosts(postsData || []);
      } catch (err) {
        setError("Không thể tải nội dung đã lưu");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchSavedPosts();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-red-500 mb-4">
          <Bookmark className="w-16 h-16 mx-auto text-red-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Lỗi tải nội dung đã lưu
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-gray-500 mb-4">
          <Bookmark className="w-16 h-16 mx-auto text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chưa có nội dung đã lưu
        </h3>
        <p className="text-gray-600">Bạn chưa lưu nội dung nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {savedPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
