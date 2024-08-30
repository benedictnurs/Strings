// src/pages/index.js
'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts, addPost } from '../lib/features/posts/postsSlice';
import { setUsers } from '../lib/features/users/usersSlice';
import Header from "@/components/Header";
import PostItem from "@/components/PostItem";
import ThreadPage from "@/components/ThreadPage";
import { ObjectId } from "@/utils/objectId";
import { useRouter } from 'next/navigation';


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
  [ObjectId("user2")]: { username: "stewie0921", name: "Stewie" },
  [ObjectId("user3")]: { username: "cbrown", name: "Clevland Brown" },
  [ObjectId("user4")]: { username: "Johndoe", name: "JD" }
};

export default function HomePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const posts = useSelector(state => state.posts);
  const users = useSelector(state => state.users);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [currentThread, setCurrentThread] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    dispatch(setPosts(initialPosts));
    dispatch(setUsers(initialUsers));
  }, [dispatch]);

  const handleOpenNewPostDialog = () => setNewPostDialogOpen(true);
  const handleCloseNewPostDialog = () => setNewPostDialogOpen(false);

  const handleSubmitNewPost = content => {
    const newPost = {
      _id: String(posts.length + 1),
      authorId: 'tester',
      content,
      createdAt: new Date().toISOString(),
      threadId: String(posts.length + 1),
      parentId: null,
    };
    dispatch(addPost(newPost));
    handleCloseNewPostDialog();
  };

  const findThreadId = (parentId) => {
    const parentPost = posts.find(post => post._id === parentId);
    return parentPost ? parentPost.threadId : parentId;
  };

  const handleAddReply = (parentId, content) => {
    const newReply = {
      _id: String(posts.length + 1),
      content,
      authorId: "1",
      parentId,
      threadId: findThreadId(parentId),
      createdAt: new Date().toISOString(),
    };

    dispatch(addPost(newReply));
  };

  const handleViewReplies = postId => {
    router.push(`/posts/${postId}`);
    setCurrentThread(postId);
  };

  const handleBack = () => {
    router.back();
    setCurrentThread(null);
  };

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
            params={{ postId: currentThread }}
            posts={posts}
            addReply={handleAddReply}
            users={users}
            onBack={handleBack}
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