// ProfileLikeButton component for toggling profile like
import { Profile } from "@/types/profile";
import React, { useState } from "react";

export default function ProfileLikeButton({
  profile,
  onUpdate,
}: {
  profile: Profile,
  onUpdate: (newLikeStatus: boolean, newLikeCount: number) => void;
}) {
  const [likeLoading, setLikeLoading] = useState(false);

  // Determine styles and icon fill
  const isLiked = profile.profileLikeStatus === true;
  const buttonClass =
    "flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 transition-colors " +
    (isLiked
      ? "text-red-500 hover:bg-red-50"
      : "text-gray-700 hover:bg-gray-50");

  const iconProps = isLiked
    ? { fill: "#ef4444", stroke: "#ef4444" }
    : { fill: "none", stroke: "currentColor" };

  return (
    <button
      className={buttonClass}
      onClick={async () => {
        setLikeLoading(true);
        try {
          await fetch("/api/protected/friend/toggleLike", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId2: profile.userId }),
          });
          const newLikeStatus = !isLiked;
          const newLikeCount = newLikeStatus ? profile.profileLikeCount + 1 : profile.profileLikeCount - 1;
          onUpdate(newLikeStatus, newLikeCount);
        } finally {
          setLikeLoading(false);
        }
      }}
      disabled={likeLoading}
      title={isLiked ? "Unlike" : "Like"}
    >
      <svg
        className="w-5 h-5"
        fill={iconProps.fill}
        stroke={iconProps.stroke}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="font-medium">
        {likeLoading ? "..." : profile.profileLikeCount}
      </span>
    </button>
  );
}