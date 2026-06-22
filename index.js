const express = require('express');
const app = express();
const ALLOWED_ORIGINS = ['https://mindacu.imweb.me', 'https://mindacu.com'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.get('/otp', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userIp = rawIp.split(',')[0].trim();

 const annotate = JSON.stringify([
    { "type": "text", "text": "IP Tracking: " + userIp, "alpha": "0.7", "color": "0x0000FF", "size": "8", "x": "2.5", "y": "3.5" }
  ]);  // ← 이게 빠져있었어요
 
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
    res.json({ otp: data.otp, playbackInfo: data.playbackInfo, clientIp: userIp });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
