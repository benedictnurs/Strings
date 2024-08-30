'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts, addPost, deletePost, editPost, toggleLike } from '../lib/features/posts/postsSlice';
import { setUsers } from '../lib/features/users/usersSlice';
import Header from "@/components/Header";
import PostItem from "@/components/PostItem";
import { ObjectId } from "@/utils/objectId";
import { useRouter } from 'next/navigation';

const initialPosts = [
  {
    _id: ObjectId("1"),
    content: "Wowah this thing works!",
    authorId: ObjectId("user1"),
    parentId: null,
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:00:00Z",
    likes: []
  },
  {
    _id: ObjectId("2"),
    content: "Wow amazing.",
    authorId: ObjectId("user2"),
    parentId: ObjectId("1"),
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:05:00Z",
    likes: []
  },
  {
    _id: ObjectId("3"),
    content: "Shut up.",
    authorId: ObjectId("user3"),
    parentId: ObjectId("2"),
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:10:00Z",
    likes: []
  },
  {
    _id: ObjectId("4"),
    content: "Urmmmm hello.",
    authorId: ObjectId("user4"),
    parentId: null,
    threadId: ObjectId("4"),
    createdAt: "2024-08-28T01:00:00Z",
    likes: ["user1"]
  },
  {
    _id: ObjectId("5"),
    content: "TO-DO add Login, add Database and add USERS!!!.",
    authorId: ObjectId("user5"),
    parentId: null,
    threadId: ObjectId("5"),
    createdAt: "2024-08-29T01:00:00Z",
    likes: ["user1", "user2", "user3","tester"]
  }
];

const initialUsers = {
  [ObjectId("user1")]: { username: "peterg", name: "Peter Griffin" },
  [ObjectId("user2")]: { username: "stewie0921", name: "Stewie" },
  [ObjectId("user3")]: { username: "cbrown", name: "Clevland Brown" },
  [ObjectId("user4")]: { username: "BrianG", name: "Brian G." },
  [ObjectId("user5")]: { username: "bn", name: "Ben N" }

};

export default function HomePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const posts = useSelector(state => state.posts);
  const users = useSelector(state => state.users);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [editingPost, setEditingPost] = useState(null);

  // Define the currentUserId
  const currentUserId = 'tester'; // Replace with actual current user ID if available

  useEffect(() => {
    dispatch(setPosts(initialPosts));
    dispatch(setUsers(initialUsers));
  }, [dispatch]);

  const handleSubmitNewPost = content => {
    const newPost = {
      _id: String(posts.length + 1),
      authorId: currentUserId, // Use currentUserId for the new post
      content,
      createdAt: new Date().toISOString(),
      threadId: String(posts.length + 1),
      parentId: null,
      likes: [],
    };
    dispatch(addPost(newPost));
    setNewPostDialogOpen(false);
  };

  const handleEditPost = (postId, newContent) => {
    dispatch(editPost({ postId, newContent }));
    setEditingPost(null);
  };

  const handleDeletePost = postId => {
    dispatch(deletePost(postId));
  };

  const handleToggleLike = postId => {
    dispatch(toggleLike(postId));
  };

  const handleViewReplies = postId => {
    router.push(`/posts/${postId}`);
  };

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
        <div className="container max-w-xl py-6">
          {posts
            .filter(post => !post.parentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(post => (
              <PostItem
                key={post._id}
                post={post}
                posts={posts}
                onViewReplies={handleViewReplies}
                users={users}
                isReply={false}
                deletePost={handleDeletePost}
                editPost={handleEditPost}
                setEditingPost={setEditingPost}
                editingPost={editingPost}
                toggleLike={handleToggleLike}
                currentUserId={currentUserId} // Pass currentUserId here
              />
            ))}
        </div>
      </main>
    </>
  );
}
