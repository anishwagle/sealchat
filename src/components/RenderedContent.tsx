"use client";

import { useRouter } from "next/navigation";

interface RenderedContentProps {
  htmlContent: string;
  className?: string;
  onNavigate?: () => void;
}

export default function RenderedContent({
  htmlContent,
  className,
  onNavigate,
}: RenderedContentProps) {
  const router = useRouter();

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a.user-mention");

    if (anchor && anchor.matches("a.user-mention")) {
      e.preventDefault();
      const href = anchor.getAttribute("href");
      if (href) {
        router.push(href);
        onNavigate?.();
      }
    }
  };

  return (
    <div
      className={className}
      onClick={handleContentClick}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}