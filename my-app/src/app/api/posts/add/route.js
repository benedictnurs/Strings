// app/api/posts/add/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Post from '@/models/Post';

export async function POST(request) {
  await connectToDatabase();

  try {
    const { content, parentId, userId } = await request.json(); // Include userId

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const newPost = new Post({
      content,
      authorId: userId, // Use the userId from the request
      parentId: parentId || null,
      threadId: parentId || null,
      createdAt: new Date(),
      likes: [],
    });

    console.log('New post:', newPost); // Log the new post

    await newPost.save();

    const postResponse = {
      _id: newPost._id.toString(),
      content: newPost.content,
      authorId: newPost.authorId,
      parentId: newPost.parentId,
      threadId: newPost.threadId,
      createdAt: newPost.createdAt.toISOString(),
      likes: newPost.likes,
    };

    return NextResponse.json(postResponse);
  } catch (error) {
    console.error('Error adding post:', error);
    return NextResponse.json({ error: 'Failed to add post' }, { status: 500 });
  }
}
