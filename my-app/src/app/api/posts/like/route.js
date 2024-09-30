// app/api/posts/like/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function PUT(request) {
  try {
    await connectToDatabase();

    const { postId, userId } = await request.json();

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'postId and userId are required' },
        { status: 400 }
      );
    }

    console.log('Received postId:', postId);
    console.log('Received userId:', userId);

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: 'Invalid postId format' },
        { status: 400 }
      );
    }

    // Check if the user already liked the post
    const post = await Post.findById(postId);
    if (!post) {
      console.error('Post not found');
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const hasLiked = post.likes.includes(userId);

    // Toggle like using atomic operators
    let updatedPost;
    if (hasLiked) {
      // Unlike: Remove userId from likes array
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      // Like: Add userId to likes array if not already present
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    }

    console.log('Updated post likes:', updatedPost.likes);

    return NextResponse.json({ message: 'Like toggled successfully' });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
