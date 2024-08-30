'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addReply as addReplyAction } from '@/lib/features/posts/postsSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import PostItem from '@/components/PostItem';
import Header from '@/components/Header';

export default function ThreadPage({ params }) {
    const { postId } = params;
    const posts = useSelector(state => state.posts);
    const users = useSelector(state => state.users);
    const dispatch = useDispatch();
    const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [replyContent, setReplyContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    const thread = (posts || []).filter(post => post.threadId === postId || post._id === postId);
    const rootPost = thread.find(post => post._id === postId);

    if (!rootPost) {
        return <div>Post Not Found</div>;
    }

    const handleAddReply = () => {
        if (replyContent.trim()) {
            const newReply = {
                _id: String(posts.length + 1),
                content: replyContent,
                authorId: "1",
                parentId: replyingTo || postId,
                threadId: rootPost.threadId,
                createdAt: new Date().toISOString(),
            };
            dispatch(addReplyAction(newReply));
            setReplyContent('');
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
        ? users[posts.find(post => post._id === replyingTo)?.authorId]?.username
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
                    />
                    <div className="relative">
                        {renderReplies(rootPost._id)}
                    </div>
                </div>
            </main>
            <div className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex items-center space-x-2 py-2">
                    <Input
                        className="flex-1"
                        placeholder={replyingTo ? `Replying to @${replyingToUsername}` : "Add a reply..."}
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
