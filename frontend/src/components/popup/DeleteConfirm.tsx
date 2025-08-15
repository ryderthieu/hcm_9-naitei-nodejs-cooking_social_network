import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/solid';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'post' | 'comment';
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type
}) => {
  if (!isOpen) return null;

  const getMessage = () => {
    return type === 'post' 
      ? 'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.'
      : 'Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.';
  };

  const getConfirmText = () => {
    return type === 'post' ? 'Xóa bài viết' : 'Xóa bình luận';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Xác nhận xóa</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed">
              {getMessage()}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              {getConfirmText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm; 
