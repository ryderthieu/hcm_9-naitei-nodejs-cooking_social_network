import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { getPostsByUser } from "../../../services/post.service";
import Post from "../../Post/Post";
import type { PostEntity } from "../../../types/post.type";

interface PostsTabProps {
  username: string;
}

export default function PostsTab({ username }: PostsTabProps) {
  const [posts, setPosts] = useState<PostEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsData = await getPostsByUser(username);
        setPosts(postsData || []);
      } catch (err) {
        setError("Không thể tải bài viết");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPosts();
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
          <FileText className="w-16 h-16 mx-auto text-red-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Lỗi tải bài viết
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-gray-500 mb-4">
          <FileText className="w-16 h-16 mx-auto text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chưa có bài viết nào
        </h3>
        <p className="text-gray-600">Người dùng này chưa đăng bài viết nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
