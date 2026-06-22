const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://mindacu.imweb.me');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.get('/otp', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  const annotate = JSON.stringify([{
    "type": "text",
    "text": userIp,
    "alpha": "0.6",
    "color": "0xFFFFFF",
    "size": "12",
    "x": "5",
    "y": "5"
  }]);

  try {
    const response = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Apisecret ${process.env.VDO_SECRET}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ ttl: 300, annotate })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
