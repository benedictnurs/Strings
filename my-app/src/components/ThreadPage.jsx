import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import PostItem from "./PostItem";

export default function ThreadPage({ postId, onBack, posts, addReply, users }) {
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const thread = posts.filter(post => post.threadId === postId || post._id === postId);
  const rootPost = thread.find(post => post._id === postId);
  
  if (!rootPost) {
    return <div>Post not found</div>;
  }

  const handleAddReply = () => {
    if (replyContent.trim()) {
      addReply(replyingTo || postId, replyContent); // Call the addReply function passed as a prop
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const handleRootPostClick = () => {
    setReplyingTo(null);
  };

  const renderReplies = parentId => {
    const replies = thread.filter(post => post.parentId === parentId);
    if (replies.length === 0) return null;

    return replies.map(reply => (
      <div key={reply._id} className="relative mt-4">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="relative">
          <PostItem
            post={reply}
            posts={posts}
            onViewReplies={() => setReplyingTo(reply._id)}
            users={users}
            isReply
          />
          {renderReplies(reply._id)}
        </div>
      </div>
    ));
  };

  const replyingToUsername = replyingTo
    ? users[posts.find(post => post._id === replyingTo).authorId]?.username
    : "";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className=" top-0 z-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="ml-4 text-lg font-semibold">String</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="container max-w-xl py-6">
          <PostItem
            post={rootPost}
            posts={posts}
            onViewReplies={handleRootPostClick}
            users={users}
          />
          <div className="relative">
            {renderReplies(rootPost._id)}
          </div>
        </div>
      </main>
      <div className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center space-x-2 py-2">
          <Avatar>
            <AvatarFallback>TS</AvatarFallback>
          </Avatar>
          <Input
            className="flex-1"
            placeholder={replyingTo ? `Stringing to @${replyingToUsername}` : "Add a string..."}
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
          />
          {replyingTo && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleAddReply} className="text-primary-foreground hover:bg-primary/90 bg-primary">Post</Button>
        </div>
      </div>
    </div>
  );
}
