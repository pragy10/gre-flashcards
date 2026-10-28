import clientPromise from './lib/mongodb.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!clientPromise) {
    return res.status(503).json({
      error: 'MONGODB_URI not configured',
      message: 'Please configure MONGODB_URI in your environment variables.'
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db('gre_flashcards');
    const collection = db.collection('days');

    if (req.method === 'GET') {
      const days = await collection.find({}).sort({ dayNumber: 1 }).toArray();
      return res.status(200).json(days);
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body) {
        return res.status(400).json({ error: 'Request body required' });
      }

      // Check if replace all or single day upsert
      if (Array.isArray(body)) {
        // Bulk replace/sync
        await collection.deleteMany({});
        if (body.length > 0) {
          await collection.insertMany(body);
        }
        return res.status(200).json({ success: true, count: body.length });
      } else if (body.id) {
        // Upsert single day document
        await collection.updateOne(
          { id: body.id },
          { $set: body },
          { upsert: true }
        );
        return res.status(200).json({ success: true, day: body });
      } else {
        return res.status(400).json({ error: 'Invalid day data' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'id query param required' });
      }
      await collection.deleteOne({ id });
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('MongoDB API error:', error);
    return res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}
