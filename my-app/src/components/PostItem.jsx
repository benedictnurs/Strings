// src/components/PostItem.jsx

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Trash,
  Edit,
} from "lucide-react";
import { getRelativeTime } from "@/utils/getRelativeTime";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

export default function PostItem({
  post,
  posts,
  comment,
  onViewReplies,
  users,
  isReply = false,
  deletePost,
  editPost,
  setEditingPost,
  editingPost,
  toggleLike,
  currentUserId,
}) {
  const user = users[post.authorId] || {}; // Safely access the user object

  const { user: currentUser } = useUser(); // Get current user from Clerk
  const isGuest = !currentUser; // Check if user is a guest

  const getTotalReplies = (postId) => {
    const directReplies = posts.filter((p) => p.parentId === postId);
    return directReplies.reduce(
      (total, reply) => total + getTotalReplies(reply._id),
      directReplies.length
    );
  };

  // Sharing Logic
  const [shareDialogOpen, setShareDialogOpen] = useState(false); // State for dialog visibility
  const [shareUrl, setShareUrl] = useState(""); // State for the copied share URL

  const totalReplies = getTotalReplies(post._id);
  const isLikedByCurrentUser = post.likes.includes(currentUserId);
  const isAuthor = currentUserId === (post.authorId || "guest");

  // Get the original post (thread) if the current post is a reply
  const getOriginalPostId = () => {
    if (isReply && post.threadId) {
      return post.threadId; // Use the threadId for replies
    }
    return post._id; // Otherwise, use the post's own id
  };

  // Copy post link to clipboard and open dialog
  const handleShare = () => {
    const origin = window.location.origin;
    const postIdToShare = getOriginalPostId();
    const shareLink = `${origin}/posts/${postIdToShare}`;

    // Copy the URL to the clipboard
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setShareUrl(shareLink); // Set the copied URL for the dialog
        setShareDialogOpen(true); // Open the dialog
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        setShareUrl(""); // Set an empty URL if copying failed
        setShareDialogOpen(true); // Still open the dialog for failure feedback
      });
  };

  // Handle Editing the Post
  const handleEditPost = async (postId, newContent) => {
    if (isGuest) {
      // For guests, only update locally (Redux store)
      editPost(postId, newContent);
      setEditingPost(null);
      return; // Skip API call
    }

    // For authenticated users, send request to the server
    try {
      const response = await fetch("/api/posts/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, content: newContent }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setEditingPost(null);
        editPost(postId, newContent); // Update the Redux store
      } else {
        console.error("Failed to update post:", await response.text());
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // Handle Deleting the Post
  const handleDeletePost = async (postId) => {
    if (isGuest) {
      // For guests, only update locally (Redux store)
      deletePost(postId);
      return; // Skip API call
    }

    // For authenticated users, send request to the server
    try {
      const response = await fetch("/api/posts/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        deletePost(postId); // Update the Redux store
      } else {
        console.error("Failed to delete post:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Handle Liking the Post
  const handleToggleLike = async (postId) => {
    const userId = currentUserId; // Use the current user ID

    if (isGuest) {
      // For guests, only update locally (Redux store)
      toggleLike(postId, userId);
      return; // Skip API call
    }

    // For authenticated users, send request to the server
    try {
      const response = await fetch("/api/posts/like", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, userId }),
      });

      if (response.ok) {
        toggleLike(postId, userId); // Update the Redux store
      } else {
        console.error("Failed to toggle like:", await response.text());
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  
  return (
    <div className={`mb-8 ${!isReply && "border-b pb-8"}`}>
      <div className="flex items-start space-x-4">
        <Avatar>
          {user.profilePicture || currentUser?.imageUrl ? (
            <AvatarImage
              src={user.profilePicture}
              alt={user.fullName || "Guest"}
            />
          ) : user.username ? (
            <AvatarFallback>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          ) : (
            <Skeleton className="h-10 w-10 rounded-full" /> // Skeleton for avatar
          )}
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            {/* Full Name with Skeleton */}
            {user.fullName ? (
              <p className="text-sm font-medium leading-none">
                {user.fullName || "Guest"}
              </p>
            ) : (
              <Skeleton className="h-4 w-32" />
            )}

            <div className="flex items-center space-x-2">
              {/* Relative Time */}
              <p className="text-sm text-muted-foreground">
                {getRelativeTime(post.createdAt)}
              </p>
              <div className="flex items-center space-x-2">
                {isAuthor && (
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
                      <DropdownMenuItem onClick={() => handleDeletePost(post._id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          {/* Username with Skeleton */}
          {user.username ? (
            <p className="text-sm text-muted-foreground">
              @{user.username.toLowerCase()}
            </p>
          ) : (
            <Skeleton className="h-4 w-24" />
          )}

          {/* Post Content or Editing Interface */}
          {editingPost && editingPost._id === post._id ? (
            <div className="space-y-2">
              <textarea
                value={editingPost.content}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, content: e.target.value })
                }
                className="mt-2 min-h-[100px] w-full border p-2 bg-zinc-950"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEditPost(post._id, editingPost.content)}
                  className="text-primary-foreground hover:bg-primary/90 bg-primary"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{post.content}</p>
          )}

          {/* Interaction Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleLike(post._id, currentUserId)}
              className={isLikedByCurrentUser ? "text-red-500" : ""}
            >
              <Heart
                className="h-4 w-4"
                fill={isLikedByCurrentUser ? "currentColor" : "none"}
              />
              <span className="sr-only">Like</span>
            </Button>

            {post.likes.length >= 0 && (
              <span className="text-sm text-muted-foreground">
                {post.likes.length}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => comment(post._id)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="sr-only">Comment</span>
            </Button>
            {/* Share button with link copying */}
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          </div>

          {/* Replies Button */}
          {totalReplies > 0 && (
            <Button
              variant="link"
              className="mt-2 p-0 h-auto text-sm text-muted-foreground"
              onClick={() => onViewReplies(post._id)}
            >
              {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
            </Button>
          )}

          {/* Share Dialog */}
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share String</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {shareUrl
                  ? "Link copied to clipboard!"
                  : "Failed to copy the link."}
              </p>
              {shareUrl && (
                <div className="mt-2 p-2 bg-zinc-950 rounded-md">
                  <Input
                    value={shareUrl}
                    readOnly
                    onClick={(e) => e.target.select()}
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={() => setShareDialogOpen(false)}
                  className="text-primary-foreground hover:bg-primary/90 bg-primary"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
