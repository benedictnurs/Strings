// app/api/posts/edit/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Post from '@/models/Post';

export async function PUT(request) {
  await connectToDatabase();

  try {
    const { postId, content } = await request.json();

    // Find and update the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { content },
      { new: true } // Return the updated document
    );

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Respond with the updated post
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
