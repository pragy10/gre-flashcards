import clientPromise from './lib/mongodb.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.MONGODB_URI) {
    return res.status(503).json({
      error: 'MONGODB_URI not configured',
      message: 'Please set MONGODB_URI in Vercel Project Settings > Environment Variables.'
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
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid JSON body' });
        }
      }

      if (!body) {
        return res.status(400).json({ error: 'Request body required' });
      }

      if (Array.isArray(body)) {
        await collection.deleteMany({});
        if (body.length > 0) {
          // Strip existing _id so Mongo doesn't complain on re-insert
          const sanitized = body.map(({ _id, ...rest }) => rest);
          await collection.insertMany(sanitized);
        }
        return res.status(200).json({ success: true, count: body.length });
      } else if (body.id) {
        const { _id, ...cleanDay } = body;
        await collection.updateOne(
          { id: body.id },
          { $set: cleanDay },
          { upsert: true }
        );
        return res.status(200).json({ success: true, day: cleanDay });
      } else {
        return res.status(400).json({ error: 'Invalid day object' });
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
    console.error('MongoDB operation error:', error);
    return res.status(500).json({ error: 'Database operation failed', message: error.message });
  }
}
