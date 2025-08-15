import { useEffect, useMemo, useState } from "react";
import Post from "./Post";
import { fetchPosts } from "../../services/post.service";
import type { PostEntity, PostsResponseMeta } from "../../types/post.type";
import PostSkeleton from "./PostSkeleton";
import { API_CONSTANTS, ERROR_MESSAGES, LOADING_MESSAGES, BUTTON_TEXTS, LABELS } from "../../constants/constants";
import { ErrorBoundary } from "../common";

interface PostListProps {
  filter?: Parameters<typeof fetchPosts>[0];
  pageSize?: number;
}

export default function PostList({ filter, pageSize = API_CONSTANTS.DEFAULT_LIMIT }: PostListProps) {
  const [items, setItems] = useState<PostEntity[]>([]);
  const [meta, setMeta] = useState<PostsResponseMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedFilter = useMemo(() => {
    const f = { ...(filter || {}) } as any;
    delete f.page;
    delete f.limit;
    return f;
  }, [filter]);

  useEffect(() => {
    let mounted = true;
    setItems([]);
    setMeta(null);
    setPage(1);
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await fetchPosts({ ...normalizedFilter, page: API_CONSTANTS.DEFAULT_PAGE, limit: pageSize });
        if (!mounted) return;
        setItems(data.posts);
        setMeta(data.meta);
      } catch (e: any) {
        if (mounted) setError(e?.message || ERROR_MESSAGES.POST_LOAD_ERROR);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [JSON.stringify(normalizedFilter), pageSize]);



  useEffect(() => {
    if (page === 1) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchPosts({ ...normalizedFilter, page, limit: pageSize });
        if (!mounted) return;
        setItems((prev) => [...prev, ...data.posts]);
        setMeta(data.meta);
      } catch (e: any) {
        if (mounted) setError(e?.message || ERROR_MESSAGES.POST_LOAD_ERROR);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page]);

  if (loading && page === 1) {
    return (
      <div className="flex flex-col items-center gap-6">
        {Array.from({ length: Math.max(1, pageSize) }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) return <div className="text-red-600">{error}</div>;

  if (!items.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{LABELS.NO_POSTS}</h3>
        <p className="text-sm text-gray-500">{LABELS.NO_POSTS_DESCRIPTION}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {items.map((p) => {
        if (!p || !p.id || !p.author) {
          return null;
        }

        return (
          <ErrorBoundary key={p.id}>
            <Post post={p} />
          </ErrorBoundary>
        );
      })}
      {meta && items.length < meta.total && (
        <button
          onClick={() => setPage((x) => x + 1)}
          disabled={loading}
          className="px-6 py-3 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? LOADING_MESSAGES.LOADING : BUTTON_TEXTS.LOAD_MORE}
        </button>
      )}
    </div>
  );
}
