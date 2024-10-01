// api/posts/fetch/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Post from '@/models/Post'; // Import the Post model

export async function GET(request) {
  try {
    await connectToDatabase(); // Ensure database is connected

    const posts = await Post.find({}).lean(); // Fetch all posts

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
export const revalidate = 0;