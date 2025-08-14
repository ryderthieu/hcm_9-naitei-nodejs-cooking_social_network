import React from "react";
import { Send } from "lucide-react";

export const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white p-8">
      <Send size={64} className="text-gray-300 mb-6" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Trình nhắn tin của bạn
      </h3>
      <p className="text-gray-500 text-center">
        Gửi tin nhắn riêng tư cho bạn bè hoặc nhóm.
      </p>
    </div>
  );
};
