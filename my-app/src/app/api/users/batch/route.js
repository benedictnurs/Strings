// src/app/api/users/batch/route.js
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(request) {
  await dbConnect();

  try {
    const { authorIds } = await request.json();

    // Debug: Log the incoming authorIds
    console.log('Received authorIds:', authorIds);

    if (!Array.isArray(authorIds)) {
      // Debug: Log invalid authorIds format
      console.log('Invalid authorIds format. Expected an array.');
      return new Response(
        JSON.stringify({ success: false, message: 'authorIds must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch users whose authorId is in the provided list
    const users = await User.find({ authorId: { $in: authorIds } });

    // Debug: Log the fetched users
    console.log('Fetched users:', users);

    // Return the users array directly
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Debug: Log any errors during the request handling
    console.error('Error fetching batch users:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
