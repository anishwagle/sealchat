"use client";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";
import PostComponent from "./Post";

interface PostListProps {
  userId?: string; // Make userId optional
  isPublic?:boolean;
  isProfile?:boolean;
}

export default function PostList({ userId ,isPublic,isProfile }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
      try {
        setLoading(true);
        let apiUrl = `/api/protected/posts`;
        if(isPublic) apiUrl+=`/public`;
        else if(isProfile) apiUrl+=`/user`;
        if(isProfile && userId) apiUrl += `/${userId}`;
        
        const data = await fetch(apiUrl);
        const results = await data.json();
        setPosts(results.posts.map((x: Post) => x));
        setError(null);
      } catch (err: any) {
        setError("Failed to load posts: " + err.message);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchPosts();
  }, [userId, isPublic]); // Add isPublic to dependency array

  if (loading) {
    return <div className="text-center text-gray-500">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center text-gray-500">No posts yet.</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id}>
            <PostComponent isLikedByCurrentUser={post.isLikedByCurrentUser} id={post.id} username={post.username} commentCount={post.commentCount} likeCount={post.likeCount} originalContent={post.originalContent} userId={post.userId} type={post.type} content={post.content} isArchived={post.isArchived} createdAt={post.createdAt} />
        </div>
      ))}
    </div>
  );
}

