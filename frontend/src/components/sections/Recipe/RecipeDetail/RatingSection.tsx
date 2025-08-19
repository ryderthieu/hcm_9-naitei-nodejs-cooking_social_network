import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import StarRating from "./StarRating";
import { recipesService } from "../../../../services/recipe.service";
import { Edit2, Trash2, MessageSquare } from "lucide-react";
import type { RatingDto } from "../../../../types/recipe.type";

interface RatingSectionProps {
  recipeId: number;
}

interface Pagination {
  totalReviews: number;
  page: number;
  limit: number;
}

const RatingSection = ({ recipeId }: RatingSectionProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<RatingDto[]>([]);
  const [userReview, setUserReview] = useState<RatingDto | null>(null);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>("");
  const [editingReview, setEditingReview] = useState<RatingDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    if (recipeId) {
      loadReviews();
      if (user) {
        loadUserReview();
      }
    }
  }, [recipeId, user]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await recipesService.getRatings(recipeId);
      const reviewList = Array.isArray(response.ratings)
        ? response.ratings
        : [];
      setReviews(reviewList);
      setPagination(response.meta || null);
      console.log("Reviews loaded:", reviewList);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReview = async () => {
    if (!user) return;
    try {
      const review = await recipesService.findUserReviewForRecipe(recipeId);
      setUserReview(review);
    } catch (error) {
      console.error("Error loading user review:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) return alert("Vui lòng đăng nhập để đánh giá");

    const parsedRating = Math.min(Math.max(Math.round(newRating), 1), 5);
    const reviewData = { rating: parsedRating, comment: newComment.trim() };

    try {
      setSubmitting(true);

      if (editingReview) {
        await recipesService.updateRating(
          recipeId,
          editingReview.id,
          reviewData
        );
        setEditingReview(null);
      } else {
        await recipesService.createRating(recipeId, reviewData);
      }

      setNewRating(0);
      setNewComment("");
      await loadReviews();
    } catch (error: any) {
      alert(error?.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: RatingDto) => {
    setEditingReview(review);
    setNewRating(review.rating);
    setNewComment(review.comment || "");
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await recipesService.deleteRating(reviewId, recipeId);
      await loadReviews();
      await loadUserReview();
    } catch (error: any) {
      alert(error?.message || "Có lỗi xảy ra khi xóa đánh giá");
    }
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setNewRating(0);
    setNewComment("");
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Đánh giá</h2>

      {user && (!userReview || editingReview) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4 text-lg text-gray-800">
            {editingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá sao
            </label>
            <StarRating
              rating={newRating}
              onRatingChange={setNewRating}
              size="lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bình luận (tùy chọn)
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về công thức này..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {newComment.length}/500 ký tự
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitReview}
              disabled={submitting || newRating === 0}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Đang gửi..."
                : editingReview
                ? "Cập nhật đánh giá"
                : "Gửi đánh giá"}
            </button>
            {editingReview && (
              <button
                onClick={cancelEdit}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      )}

      {user && userReview && !editingReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                Đánh giá của bạn
              </h4>
              <StarRating rating={userReview.rating} readonly size="sm" />
              {userReview.comment && (
                <p className="text-gray-600 mt-2">{userReview.comment}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(userReview.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditReview(userReview)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                title="Chỉnh sửa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteReview(userReview.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-4 text-lg text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Đánh giá từ cộng đồng
          {pagination && pagination.totalReviews > 0 && (
            <span className="text-sm text-gray-500">
              ({pagination.totalReviews} đánh giá)
            </span>
          )}
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={
                          review.user?.avatar ||
                          "/placeholder.svg?height=40&width=40"
                        }
                        alt={
                          `${review.user?.firstName || ""} ${
                            review.user?.lastName || ""
                          }`.trim() || "User"
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {`${review.user?.firstName || ""} ${
                          review.user?.lastName || ""
                        }`.trim() || "Người dùng"}
                      </h4>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 leading-relaxed ml-12">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có đánh giá nào cho công thức này</p>
            {user && !userReview && (
              <p className="text-sm">Hãy là người đầu tiên đánh giá!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingSection;
