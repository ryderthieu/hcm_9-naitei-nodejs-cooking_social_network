import React from 'react';
import { useDropdown } from '../../../hooks';

// ==================== ThreeDotsMenu Component ====================
interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'danger';
}

interface ThreeDotsMenuProps {
  items: MenuItem[];
  className?: string;
}

export function ThreeDotsMenu({ items, className = "" }: ThreeDotsMenuProps) {
  const { isOpen, dropdownRef, toggle } = useDropdown();

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm6 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm6 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                item.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${item.className || ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== ActionButton Component ====================
interface ActionButtonProps {
  icon: React.ReactNode;
  count: number;
  isActive?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  variant?: 'feed' | 'detail';
  className?: string;
  activeColor?: string;
}

export function ActionButton({
  icon,
  count,
  isActive = false,
  isLoading = false,
  onClick,
  variant = 'feed',
  className = '',
  activeColor = 'text-yellow-600'
}: ActionButtonProps) {
  const getContainerStyles = () => {
    if (isActive) {
      return 'bg-yellow-100 rounded-full px-4 py-2';
    }
    return 'rounded-full px-4 py-2';
  };

  const getIconStyles = () => {
    if (isActive) {
      return activeColor;
    }
    return 'text-gray-600';
  };

  const getTextStyles = () => {
    if (isActive) {
      return 'text-yellow-700';
    }
    return 'text-gray-600';
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center ${
        variant === 'detail' ? 'justify-center' : ''
      } gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:bg-yellow-100 disabled:opacity-50 ${getContainerStyles()} ${className}`}
    >
      <div className={`w-5 h-5 ${variant === 'detail' ? 'shrink-0 block' : ''} ${getIconStyles()}`}>
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-600"></div>
        ) : (
          icon
        )}
      </div>
      <span className={`text-sm font-medium ${getTextStyles()}`}>
        {count}
      </span>
    </button>
  );
}

// ==================== LoadingSpinner Component ====================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}></div>
  );
}

// ==================== ErrorBoundary Component ====================
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Đã xảy ra lỗi
            </h2>
            <p className="text-red-600 mb-4">
              Có lỗi xảy ra khi tải nội dung này.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
