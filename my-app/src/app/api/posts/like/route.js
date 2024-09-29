// app/api/posts/like/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Post from '@/models/Post';

export async function PUT(request) {
  await connectToDatabase();

  try {
    const { postId, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the user has already liked the post
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // User has not liked the post yet, add the userId to likes
      post.likes.push(userId);
    } else {
      // User has already liked the post, remove the userId from likes
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    // Return the updated post
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
