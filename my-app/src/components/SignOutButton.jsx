// src/components/SignOutButton.js
'use client';

import { useClerk } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react'; // Import the LogOut icon

export const SignOutButton = () => {
  const { signOut } = useClerk();

  return (
    <Button variant="ghost" size="icon" onClick={() => signOut({ redirectUrl: '/sign-up' })}>
      <LogOut className="h-5 w-5" />
      <span className="sr-only">Sign Out</span>
    </Button>
  );
};
