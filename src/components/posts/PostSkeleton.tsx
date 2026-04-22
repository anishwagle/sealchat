"use client";

export default function PostSkeleton() {
  return (
    <div className="bg-background rounded-lg border border-border p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-muted"></div>
        <div className="flex-1">
          <div className="h-4 bg-muted rounded-md mb-2 w-32"></div>
          <div className="h-3 bg-muted rounded-md w-24"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-muted rounded-md w-full"></div>
        <div className="h-4 bg-muted rounded-md w-5/6"></div>
        <div className="h-4 bg-muted rounded-md w-4/6"></div>
      </div>

      {/* Interaction buttons */}
      <div className="pt-4 border-t border-border">
        <div className="flex gap-4">
          <div className="h-5 bg-muted rounded-md w-12"></div>
          <div className="h-5 bg-muted rounded-md w-12"></div>
          <div className="h-5 bg-muted rounded-md w-12"></div>
        </div>
      </div>
    </div>
  );
}
