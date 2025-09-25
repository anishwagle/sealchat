"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Post } from "@/types/post";
import PostComponent from "@/components/posts/Post";

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let apiUrl = `/api/protected/posts/${postId}`;

      const data = await fetch(apiUrl);
      const results = await data.json();
      setPost(results.post);
      setError(null);
    } catch (err: any) {
      setError("Failed to load posts: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, []); // Add isPublic to dependency array

  if (loading) {
    return <div className="text-center text-gray-500">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!post) {
    return <div className="text-center text-gray-500">No posts Found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
          <PostComponent
            id={post.id}
            username={post.username}
            commentCount={post.commentCount}
            likeCount={post.likeCount}
            originalContent={post.originalContent}
            userId={post.userId}
            type={post.type}
            content={post.content}
            isArchived={post.isArchived}
            createdAt={post.createdAt}
          />
        </div>
  );
}
