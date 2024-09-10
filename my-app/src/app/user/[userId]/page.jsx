// src/pages/user/[slug].js
"use client"
import Header from "@/components/Header";
import Link from 'next/link'; // Import Link from next/link
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react"; // Import the Cog icon

const UserProfilePage = () => {
  return (
    <div>
      <Header />
      <div className="container">
        <Link href="/user-profile">
          <Button
            variant="ghost"
            size="icon"
          >
            <Pencil className="h-5 w-5" />
            <span className="sr-only">Edit Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UserProfilePage;
