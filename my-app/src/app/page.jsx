'use client'
// src/pages/index.js
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PostItem from "@/components/PostItem";
import ThreadPage from "@/components/ThreadPage";
import { ObjectId } from "@/utils/objectId";

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
    content: "Wow amazing.",
    authorId: ObjectId("user2"),
    parentId: ObjectId("1"),
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:05:00Z"
  },
  {
    _id: ObjectId("3"),
    content: "Shut up.",
    authorId: ObjectId("user3"),
    parentId: ObjectId("2"),
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:10:00Z"
  },
  {
    _id: ObjectId("4"),
    content: "Urmmmm hello.",
    authorId: ObjectId("user4"),
    parentId: null,
    threadId: ObjectId("4"),
    createdAt: "2024-08-28T01:00:00Z"
  }
];

const initialUsers = {
  [ObjectId("user1")]: { username: "peterg", name: "Peter Griffin" },
  [ObjectId("user2")]: { username: "stewie0921  ", name: "Stewie" },
  [ObjectId("user3")]: { username: "cbrown", name: "Clevland Brown" },
  [ObjectId("user4")]: { username: "Johndoe", name: "JD" }
};

export default function HomePage() {
  const [posts, setPosts] = useState(initialPosts);
  const [users, setUsers] = useState(initialUsers);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState(""); // State for new post content
  const [currentThread, setCurrentThread] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    // Fetch posts and users from an API or some source if needed
  }, []);

  const handleOpenNewPostDialog = () => setNewPostDialogOpen(true);
  const handleCloseNewPostDialog = () => setNewPostDialogOpen(false);

  const handleSubmitNewPost = content => {
    // Logic to add a new post to state
    const newPost = {
      _id: String(posts.length + 1),
      authorId: 'tester', // Example authorId
      content,
      createdAt: new Date().toISOString(),
      threadId: String(posts.length + 1),
      parentId: null,
    };
    setPosts([newPost, ...posts]);
    handleCloseNewPostDialog(); // Close the dialog after submission
  };

  const findThreadId = (parentId) => {
    const parentPost = posts.find(post => post._id === parentId);
    return parentPost ? parentPost.threadId : parentId; // Return the parentId if no threadId is found
  };

  const handleAddReply = (parentId, content) => {
    const newReply = {
      _id: String(posts.length + 1),
      content,
      authorId: "1", // Example authorId (replace with dynamic logic)
      parentId,
      threadId: findThreadId(parentId),
      createdAt: new Date().toISOString(),
    };

    setPosts(prevPosts => [newReply, ...prevPosts]);
  };

  const handleViewReplies = postId => setCurrentThread(postId);
  const handleBack = () => setCurrentThread(null);

  const handleReplyChange = e => setReplyContent(e.target.value);

  return (
    <>
      <Header
        open={newPostDialogOpen}
        onOpenChange={setNewPostDialogOpen}
        newPostContent={newPostContent}
        setNewPostContent={setNewPostContent}
        addNewPost={handleSubmitNewPost}
      />
      <main>
        {currentThread ? (
          <ThreadPage
            postId={currentThread}
            onBack={handleBack}
            posts={posts}
            addReply={handleAddReply}
            users={users}
          />
        ) : (
          <div className="container max-w-xl py-6">
            {posts
              .filter(post => !post.parentId)
              .map(post => (
                <PostItem
                  key={post._id}
                  post={post}
                  posts={posts}
                  onViewReplies={handleViewReplies}
                  users={users}
                />
              ))}
          </div>
        )}
      </main>
    </>
  );
}
