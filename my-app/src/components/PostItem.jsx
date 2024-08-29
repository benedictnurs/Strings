import { useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react";
import { getRelativeTime } from "@/utils/getRelativeTime";

export default function PostItem({ post, posts, onViewReplies, users, isReply = false }) {
  const replies = posts.filter(p => p.parentId === post._id);
  const user = users[post.authorId];

  // Debugging logs
  useEffect(() => {
    console.log("Post:", post);
    console.log("All Posts:", posts);
    console.log("Replies:", replies);
  }, [post, posts]);

  const getTotalReplies = postId => {
    const directReplies = posts.filter(p => p.parentId === postId);
    return directReplies.reduce(
      (total, reply) => total + getTotalReplies(reply._id),
      directReplies.length
    );
  };

  const totalReplies = getTotalReplies(post._id);

  return (
    <div className={`mb-8 ${!isReply && "border-b pb-8"}`}>
      <div className="flex items-start space-x-4">
        <Avatar>
          <AvatarFallback>
            {user ? user.username.slice(0, 2).toUpperCase() : "NA"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium leading-none">
              {user ? user.name : "Test User"}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                {getRelativeTime(post.createdAt)}
              </p>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {user ? `@${user.username.toLowerCase()}` : "@tester"}
          </p>
          <div className="text-sm">
            <p className="whitespace-pre-wrap break-words overflow-hidden text-ellipsis">
              {post.content}
            </p>
          </div>
          <div className="flex items-center space-x-4 pt-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Like</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onViewReplies(post._id)}>
              <MessageCircle className="h-4 w-4" />
              <span className="sr-only">Comment</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Repeat2 className="h-4 w-4" />
              <span className="sr-only">Repost</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
          {totalReplies > 0 && (
            <Button
              variant="link"
              className="mt-2 p-0 h-auto text-sm text-muted-foreground"
              onClick={() => onViewReplies(post._id)}
            >
              {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
