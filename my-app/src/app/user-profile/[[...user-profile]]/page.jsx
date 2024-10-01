'use client';

import { UserProfile, useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const UserProfilePage = () => {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Redirect to sign-up if the user is not logged in
        if (isLoaded && !user) {
            router.push('/sign-up');
        }
    }, [isLoaded, user, router]);

    if (!isLoaded || !user) {
        // Show a loading message or spinner while checking user status
        return (        <div className="min-h-screen flex flex-col">

            <div className='flex-grow flex items-center justify-center p-4 text-3xl'>Loading...</div>    </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4">
                <UserProfile path="/user-profile" />
            </main>
        </div>
    );
};

export default UserProfilePage;
