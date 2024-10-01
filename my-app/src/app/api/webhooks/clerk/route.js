// src/app/api/webhooks/clerk/route.js
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(req) {
  // Clerk webhook secret
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text(); // Use text() because Svix expects raw body
  const body = payload;

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Connect to MongoDB
  try {
    await dbConnect();
  } catch (error) {
    console.error('Database connection error:', error);
    return new Response('Database connection error', {
      status: 500,
    });
  }

  // Handle different event types
  const { type, data } = evt;

  try {
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled event type ${type}`);
    }
    return new Response('Webhook received and processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return new Response('Error processing webhook event', { status: 500 });
  }
}

// Handler for user.created event
async function handleUserCreated(data) {
  const { id, username, first_name, last_name, profile_image_url } = data;

  const fullName = `${first_name} ${last_name}`.trim();

  // Create a new user document
  await User.create({
    authorId: id,
    username: username || '',
    fullName: fullName || '',
    profilePicture: profile_image_url || '',
  });

  console.log(`User created: ${id}`);
}

// Handler for user.updated event
async function handleUserUpdated(data) {
  const { id, username, first_name, last_name, profile_image_url } = data;

  const fullName = `${first_name} ${last_name}`.trim();

  // Update the existing user document
  const updatedUser = await User.findOneAndUpdate(
    { authorId: id },
    {
      username: username || '',
      fullName: fullName || '',
      profilePicture: profile_image_url || '',
    },
    { new: true }
  );

  if (updatedUser) {
    console.log(`User updated: ${id}`);
  } else {
    console.warn(`User not found for update: ${id}`);
  }
}

// Handler for user.deleted event
async function handleUserDeleted(data) {
  const { id } = data;

  // Delete the user document
  const deletedUser = await User.findOneAndDelete({ authorId: id });

  if (deletedUser) {
    console.log(`User deleted: ${id}`);
  } else {
    console.warn(`User not found for deletion: ${id}`);
  }
}
export const revalidate = 0;