// src/components/Header.js
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PenSquare, ArrowLeft, Heart, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from '../components/SignOutButton';
import { useUser } from '@clerk/clerk-react';

export default function Header({
    open,
    onOpenChange,
    newPostContent,
    setNewPostContent,
    addNewPost
}) {
    const pathname = usePathname();
    const { isSignedIn, user } = useUser(); // Use Clerk's useUser hook

    const handleSubmitNewPost = () => {
        if (newPostContent.trim()) {
            addNewPost(newPostContent);
            setNewPostContent(""); // Clear the textarea
            onOpenChange(false); // Close the dialog
        }
    };

    // Check if the pathname is either "/" or starts with "/posts"
    const isRootOrPosts = pathname === "/" || pathname.startsWith("/posts");
    const isUserProfile = pathname === "/user-profile" || pathname.startsWith("/user");

    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="flex w-full justify-between items-center">
                    <div className="flex items-center space-x-4">
                        {(isRootOrPosts || isUserProfile) && pathname !== "/" && (
                            <Button variant="ghost" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        )}
                        <Link href="/">
                            <h1 className="text-lg font-semibold">&#123;Strings&#125;</h1>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isRootOrPosts && (
                            <>
                                {pathname === "/" && (
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
                                )}
                                {isSignedIn && user && (
                                    <Link href={`/user/${user.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <User className="h-5 w-5" />
                                            <span className="sr-only">Profile</span>
                                        </Button>
                                    </Link>
                                )}
                            </>
                        )}
                        {isSignedIn ? (
                            <SignOutButton />
                        ) : (
                            !isSignedIn && !pathname.startsWith("/sign-up") && !pathname.startsWith("/sign-in") && (
                                <Link href='/sign-up'>
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5" />
                                        <span className="sr-only">Profile</span>
                                    </Button>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
