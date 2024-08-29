"use client"
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Home,
  Search,
  PenSquare,
  Heart,
  User,
  MoreHorizontal,
  MessageCircle,
  Repeat2,
  Send,
  ArrowLeft,
  X
} from "lucide-react"

// Simulating ObjectId for the example
const ObjectId = id => id

const initialPosts = [
  {
    _id: ObjectId("1"),
    content: "This is the original post.",
    authorId: ObjectId("user1"),
    parentId: null,
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:00:00Z"
  },
  {
    _id: ObjectId("2"),
    content: "This is a reply to the original post.",
    authorId: ObjectId("user2"),
    parentId: ObjectId("1"),
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:05:00Z"
  },
  {
    _id: ObjectId("3"),
    content: "This is a reply to the reply.",
    authorId: ObjectId("user3"),
    parentId: ObjectId("2"),
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:10:00Z"
  },
  {
    _id: ObjectId("4"),
    content: "This is another original post.",
    authorId: ObjectId("user4"),
    parentId: null,
    threadId: ObjectId("4"),
    createdAt: "2024-08-28T01:00:00Z"
  }
]

const users = {
  [ObjectId("user1")]: { username: "User1", name: "Alice Johnson" },
  [ObjectId("user2")]: { username: "User2", name: "Bob Smith" },
  [ObjectId("user3")]: { username: "User3", name: "Charlie Brown" },
  [ObjectId("user4")]: { username: "User4", name: "Diana Ross" }
}


export default function Component() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [posts, setPosts] = useState(initialPosts)
  const [newPostContent, setNewPostContent] = useState("")
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false)

  const handleViewReplies = postId => {
    setSelectedPostId(postId)
    setCurrentPage("thread")
  }

  const addReply = (parentId, content) => {
    const parentPost = posts.find(post => post._id === parentId)
    if (!parentPost) return

    const newReply = {
      _id: ObjectId(Date.now().toString()),
      content,
      authorId: ObjectId("user1"), // Assuming current user is User1
      parentId,
      threadId: parentPost.threadId,
      createdAt: new Date().toISOString()
    }

    setPosts(prevPosts => [...prevPosts, newReply])
  }

  const addNewPost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        _id: ObjectId(Date.now().toString()),
        content: newPostContent,
        authorId: ObjectId("user1"), // Assuming current user is User1
        parentId: null,
        threadId: ObjectId(Date.now().toString()),
        createdAt: new Date().toISOString()
      }
      setPosts(prevPosts => [newPost, ...prevPosts])
      setNewPostContent("")
      setIsNewPostDialogOpen(false)
    }
  }

  if (currentPage === "thread") {
    return (
      <ThreadPage
        postId={selectedPostId}
        onBack={() => setCurrentPage("home")}
        posts={posts}
        addReply={addReply}
      />
    )
  }

  const rootPosts = posts.filter(post => post.parentId === null)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex w-full justify-between items-center">
            <a className="text-lg font-semibold" href="/">
              Strings
            </a>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setIsNewPostDialogOpen(true)}>
                <PenSquare className="h-5 w-5" />
                <span className="sr-only">Compose</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Activity</span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container max-w-xl py-6">
          {rootPosts.map(post => (
            <PostItem
              key={post._id}
              post={post}
              posts={posts}
              onViewReplies={handleViewReplies}
            />
          ))}
        </div>
      </main>
      <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new string</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={addNewPost}>Post</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PostItem({ post, posts, onViewReplies, isReply = false }) {
  const replies = posts.filter(p => p.parentId === post._id)
  const user = users[post.authorId]

  const getTotalReplies = postId => {
    const directReplies = posts.filter(p => p.parentId === postId)
    return directReplies.reduce(
      (total, reply) => total + getTotalReplies(reply._id),
      directReplies.length
    )
  }

  const totalReplies = getTotalReplies(post._id)

  return (
    <div className={`mb-8 ${!isReply && "border-b pb-8"}`}>
      <div className="flex items-start space-x-4">
        <Avatar>
          <AvatarImage src={`https://i.pravatar.cc/150?img=${post._id}`} />
          <AvatarFallback>
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                {new Date(post.createdAt).toLocaleString()}
              </p>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            @{user.username.toLowerCase()}
          </p>
          <p className="text-sm">{post.content}</p>
          <div className="flex items-center space-x-4 pt-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Like</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewReplies(post._id)}
            >
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
              {totalReplies} {totalReplies === 1 ? "string" : "strings"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
// Update the ThreadPage component
function ThreadPage({ postId, onBack, posts, addReply }) {
  const [replyContent, setReplyContent] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)

  const thread = posts.filter(post => post.threadId === postId)
  const rootPost = thread.find(post => post._id === postId)

  if (!rootPost) {
    return <div>Post not found</div>
  }

  const handleAddReply = () => {
    if (replyContent.trim()) {
      addReply(replyingTo || postId, replyContent)
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  // Function to handle clicking the root post to reset to "Add a comment..."
  const handleRootPostClick = () => {
    setReplyingTo(null) // Ensure the input shows "Add a comment..."
  }

  // Function to render replies recursively
  const renderReplies = parentId => {
    const replies = thread.filter(post => post.parentId === parentId)
    if (replies.length === 0) return null // No line if there are no replies

    return replies.map(reply => (
      <div key={reply._id} className="relative mt-4">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="relative">
          <PostItem
            post={reply}
            posts={posts}
            onViewReplies={() => setReplyingTo(reply._id)}
            isReply
          />
          {renderReplies(reply._id)}
        </div>
      </div>
    ))
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            onViewReplies={handleRootPostClick} // Reset to "Add a comment..." when clicked
          />
          <div className="relative">
            {renderReplies(rootPost._id) /* Only show line if there are replies */}
          </div>
        </div>
      </main>
      <div className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center space-x-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://i.pravatar.cc/150?img=5" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <Input
            className="flex-1"
            placeholder={replyingTo ? "Add a reply..." : "Add a comment..."} // Adjusted placeholder
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
          <Button onClick={handleAddReply}>Post</Button>
        </div>
      </div>
    </div>
  )
}
