// app/api/posts/delete/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Post from '@/models/Post';

export async function DELETE(request) {
  await connectToDatabase();

  try {
    const { postId } = await request.json();

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete the post and its replies recursively
    await deletePostAndReplies(postId);

    return NextResponse.json({ message: 'Post and its replies deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post and its replies' }, { status: 500 });
  }
}

async function deletePostAndReplies(postId) {
  // Delete the post itself
  await Post.findByIdAndDelete(postId);

  // Find all replies where parentId equals the current postId
  const replies = await Post.find({ parentId: postId });

  // Recursively delete each reply and its descendants
  for (const reply of replies) {
    await deletePostAndReplies(reply._id);
  }
}
export const revalidate = 0;