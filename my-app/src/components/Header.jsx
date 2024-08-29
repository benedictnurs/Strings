// src/components/Header.js
import { Button } from "@/components/ui/button";
import { PenSquare, Heart, User } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react"; // Import useState for managing dialog state

export default function Header({ open, onOpenChange, newPostContent, setNewPostContent, addNewPost }) {
    const handleSubmitNewPost = () => {
        // Handle new post submission
        if (newPostContent.trim()) {
            addNewPost(newPostContent);
            setNewPostContent(""); // Clear the textarea
            onOpenChange(false); // Close the dialog
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="flex w-full justify-between items-center">
                    <a className="text-lg font-semibold" href="/">
                        &#123;Strings&#125;
                    </a>
                    <nav className="flex items-center space-x-4">
                        <Dialog open={open} onOpenChange={onOpenChange}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <PenSquare className="h-5 w-5" />
                                    <span className="sr-only">Compose</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create a new string</DialogTitle>
                                </DialogHeader>
                                <textarea
                                    placeholder="What's on your mind?"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    className="min-h-[100px] w-full border p-2 bg-zinc-950"
                                />
                                <Button
                                    onClick={handleSubmitNewPost}
                                    className="text-primary-foreground hover:bg-primary/90 bg-primary"
                                >
                                    Post
                                </Button>
                            </DialogContent>
                        </Dialog>
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
    );
}
