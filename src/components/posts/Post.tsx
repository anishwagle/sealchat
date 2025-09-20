"use client";
import { Post } from "@/types/post";
import { getTimeSince, getTimeUntil } from "@/utils/dateConveter";



export default function PostComponent( post: Post) {

  return (

        <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
              {post.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{post.username}</p>

              <p className="text-sm text-gray-500">
                {post.type === "friend_post"
                  ? "Friends Only"
                  : "Public Opinion"}{" "}
                • {getTimeSince(new Date(post.createdAt))}
                {post.expiresAt && (
                  <span> • {getTimeUntil(new Date(post.expiresAt))}</span>
                )}
              </p>
            </div>
          </div>
          <p
            className="mt-4 text-gray-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></p>
          <div className="mt-4 flex gap-6 text-sm text-gray-500">
            <button className="flex items-center gap-2 hover:text-blue-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>0 likes</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>0 comments</span>
            </button>
          </div>
        </div>

  );
}
