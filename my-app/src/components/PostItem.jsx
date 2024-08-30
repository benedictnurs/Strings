import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal, Trash, Edit } from "lucide-react";
import { getRelativeTime } from "@/utils/getRelativeTime";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostItem({
  post,
  posts,
  onViewReplies,
  users,
  isReply = false,
  deletePost,
  editPost,
  setEditingPost,
  editingPost,
  toggleLike,
}) {
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
              <div className="flex items-center space-x-2">
                {post.authorId === "tester" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingPost(post)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deletePost(post._id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {user ? `@${user.username.toLowerCase()}` : "@tester"}
          </p>
          {editingPost && editingPost._id === post._id ? (
            <div className="space-y-2">
              <textarea
                value={editingPost.content}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                className="mt-2 min-h-[100px] w-full border p-2 bg-zinc-950"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
                <Button onClick={() => editPost(post._id, editingPost.content)} className="text-primary-foreground hover:bg-primary/90 bg-primary">Save</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{post.content}</p>
          )}
          <div className="flex items-center space-x-4 pt-2">
            <Button variant="ghost" size="icon" onClick={() => toggleLike(post._id)}>
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
