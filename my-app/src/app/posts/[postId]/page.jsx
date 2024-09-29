'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addReply as addReplyAction,
  deletePost as deletePostAction,
  editPost as editPostAction,
  toggleLike as toggleLikeAction,
  setPosts,
} from '@/lib/features/posts/postsSlice';
import { setUsers } from '@/lib/features/users/usersSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import PostItem from '@/components/PostItem';
import Header from '@/components/Header';
import { useUser } from '@clerk/clerk-react';

export default function ThreadPage({ params }) {
  const { postId } = params;
  const posts = useSelector((state) => state.posts);
  const users = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // Get the current user using Clerk
  const { user } = useUser();
  const currentUserId = user?.id || 'guest'; // Use 'guest' if not signed in
  const isGuest = !user; // Determine if the user is a guest

  // Include current user in users if not present
  useEffect(() => {
    if (currentUserId && !users[currentUserId]) {
      const updatedUsers = {
        ...users,
        [currentUserId]: {
          username: user?.username || 'guest',
          name: user?.fullName || 'Guest User',
          profilePicture: user?.profileImageUrl || '',
        },
      };
      dispatch(setUsers(updatedUsers));
    }
  }, [currentUserId, users, dispatch, user]);

  // Fetch all posts and set them in the Redux store (if not already fetched)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts'); // Adjust the endpoint as needed
        if (response.ok) {
          const allPosts = await response.json();
          dispatch(setPosts(allPosts)); // Replace the posts array
        } else {
          console.error('Failed to fetch posts:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    if (posts.length === 0) {
      fetchPosts();
    }
  }, [dispatch]);

  const rootPost = posts.find((post) => post._id === postId);

  if (!rootPost) {
    return <div>Post Not Found</div>;
  }

  // Handle editing a post
  const handleEditPost = async (postId, newContent) => {
    if (isGuest) {
      // Handle edit locally
      dispatch(editPostAction({ postId, newContent }));
      setEditingPost(null);
    } else {
      try {
        const response = await fetch('/api/posts/edit', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId, content: newContent }),
        });

        if (response.ok) {
          setEditingPost(null); // Close the editing UI
          // Update the Redux store with the updated post
          dispatch(editPostAction({ postId, newContent }));
        } else {
          console.error('Failed to update post:', await response.text());
        }
      } catch (error) {
        console.error('Error updating post:', error);
      }
    }
  };

  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    if (isGuest) {
      // Handle delete locally
      dispatch(deletePostAction(postId));
    } else {
      try {
        const response = await fetch('/api/posts/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        });
        dispatch(deletePostAction(postId));

        if (response.ok) {
          // Update the Redux store
          dispatch(deletePostAction(postId));
        } else {
          console.error('Deleted post:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  // Handle adding a reply
  const handleAddReply = async () => {
    if (replyContent.trim()) {
      if (isGuest) {
        // Handle reply locally
        const newReply = {
          _id: String(Date.now()), // Generate a unique ID
          content: replyContent,
          authorId: 'guest',
          parentId: replyingTo || postId,
          threadId: rootPost.threadId,
          createdAt: new Date().toISOString(),
          likes: [],
        };
        dispatch(addReplyAction(newReply));
        setReplyContent('');
        setReplyingTo(null);
      } else {
        // Proceed with API call
        const replyData = {
          content: replyContent,
          userId: currentUserId,
          parentId: replyingTo || postId,
          threadId: rootPost.threadId,
        };

        try {
          const response = await fetch('/api/posts/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(replyData),
          });

          if (response.ok) {
            const newReply = await response.json();
            dispatch(addReplyAction(newReply)); // Update the Redux store
            setReplyContent(''); // Clear the input
            setReplyingTo(null); // Reset replyingTo
          } else {
            console.error('Failed to add reply:', await response.text());
          }
        } catch (error) {
          console.error('Error adding reply:', error);
        }
      }
    }
  };

  // Handle toggling like
  const handleToggleLike = async (postId) => {
    const userId = currentUserId;

    if (isGuest) {
      // Handle toggle like locally
      dispatch(toggleLikeAction({ postId, userId }));
    } else {
      try {
        const response = await fetch('/api/posts/like', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId, userId }),
        });

        if (response.ok) {
          // Update the Redux store
          dispatch(toggleLikeAction({ postId, userId }));
        } else {
          console.error('Failed to toggle like:', await response.text());
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    }
  };

  const handleRootPostClick = () => {
    setReplyingTo(null);
  };

  // Function to get username by authorId
  const getUsernameById = (authorId) => {
    if (users[authorId]) {
      return users[authorId].username;
    } else if (authorId === currentUserId) {
      return user?.username || 'Guest';
    } else {
      return 'Unknown User';
    }
  };

  // Render replies recursively with separate vertical lines for root replies
  const renderReplies = (parentId, isNested = false) => {
    const replies = posts.filter((post) => post.parentId === parentId);
    if (replies.length === 0) return null;

    return replies.map((reply) => {
      const isReplyToRoot = reply.parentId === rootPost._id;
      return (
        <div key={reply._id} className="relative mt-4">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="relative">
            <PostItem
              post={reply}
              posts={posts}
              onViewReplies={() => setReplyingTo(reply._id)}
              users={users}
              deletePost={handleDeletePost}
              editPost={handleEditPost}
              setEditingPost={setEditingPost}
              editingPost={editingPost}
              isReply
              toggleLike={handleToggleLike}
              currentUserId={currentUserId}
            />
            {/* Render nested replies */}
            {renderReplies(reply._id, true)}
          </div>
        </div>
      );
    });
  };

  const replyingToPost = posts.find((post) => post._id === replyingTo);
  const replyingToUsername = replyingToPost
    ? getUsernameById(replyingToPost.authorId)
    : '';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        showBackButton={true}
        showComposeButton={false}
        open={newPostDialogOpen}
        onOpenChange={setNewPostDialogOpen}
        newPostContent={newPostContent}
        setNewPostContent={setNewPostContent}
        addNewPost={() => {}}
      />

      <main className="flex-1">
        <div className="container max-w-xl py-6">
          <PostItem
            post={rootPost}
            posts={posts}
            onViewReplies={handleRootPostClick}
            users={users}
            deletePost={handleDeletePost}
            editPost={handleEditPost}
            setEditingPost={setEditingPost}
            toggleLike={handleToggleLike}
            currentUserId={currentUserId}
          />
          {/* Render replies to the root post */}
          <div className="relative">
            {renderReplies(rootPost._id)}
          </div>
        </div>
      </main>
      <div className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center space-x-2 py-2">
          <Input
            className="flex-1"
            placeholder={
              replyingTo
                ? `Replying to @${replyingToUsername}`
                : 'Add a reply...'
            }
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
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
          <Button
            onClick={handleAddReply}
            className="text-primary-foreground hover:bg-primary/90 bg-primary"
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
