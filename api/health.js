import clientPromise from './lib/mongodb.js';

export default async function handler(req, res) {
  // Always return JSON
  res.setHeader('Content-Type', 'application/json');

  if (!process.env.MONGODB_URI) {
    return res.status(200).json({
      status: 'error',
      message: 'MONGODB_URI environment variable is not defined in Vercel.',
      configured: false
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db('gre_flashcards');
    await db.command({ ping: 1 });
    const count = await db.collection('days').countDocuments();
    return res.status(200).json({
      status: 'connected',
      message: 'Successfully connected to MongoDB Atlas!',
      configured: true,
      daysCount: count
    });
  } catch (error) {
    return res.status(200).json({
      status: 'connection_failed',
      error: error.message,
      configured: true
    });
  }
}
