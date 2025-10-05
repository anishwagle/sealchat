"use client";
import React from "react";

interface LoadingProps {
  message: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message, fullScreen }) => {
  const containerClass = fullScreen
    ? "fixed top-0 left-0 w-full h-full bg-white z-50 flex items-center justify-center"
    : "flex items-center justify-center";

  const spinnerClass = fullScreen ? "w-16 h-16" : "w-8 h-8";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center">
        <svg
          className={`animate-spin ${spinnerClass} text-blue-500`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default Loading;