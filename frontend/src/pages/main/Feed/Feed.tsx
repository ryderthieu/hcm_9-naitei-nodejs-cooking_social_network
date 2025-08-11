import PostList from "../../../components/Post/PostList";

export default function Feed() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bảng tin</h1>
          <p className="text-gray-600">Khám phá những món ăn ngon từ cộng đồng</p>
        </div>

        <PostList />
      </div>
    </div>
  );
}
