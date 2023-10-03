const express = require('express');
const querystring = require('querystring');
const axios = require('axios');
const cors = require ('cors')
require('dotenv').config()

const { recetlyPlayedTracks } = require('./spotify');

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://accounts.spotify.com/en/authorize?response_type=code&client_id=1afde426b48347c7baacc526df092900&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=MVJTFIOxc6Vj6eLP'
  ],
  preflightContinue: true,
};

const tokenEndpoint = 'https://accounts.spotify.com/api/token';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

let accessToken = null;
let refreshToken = null;
let tokenExpirationTime = null;

let logedIn = false;

app.use(async (req, res, next) => {
  if(!logedIn) {
    next();
  } else {
    if (!accessToken || !tokenExpirationTime || Date.now() > tokenExpirationTime) {
      try {
        const data = new URLSearchParams();
        data.append('grant_type', 'refresh_token');
        data.append('refresh_token', refreshToken);
  
        const authString = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
        const base64AuthString = Buffer.from(authString).toString('base64');
  
        const config = {
          headers: {
            'Authorization': `Basic ${base64AuthString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
  
        const response = await axios.post(tokenEndpoint, data, config);
  
        if (response.status === 200) {
          accessToken = response.data.access_token;
          const expiresInMilliseconds = response.data.expires_in * 1000;
          tokenExpirationTime = Date.now() + expiresInMilliseconds;
        } else {
          throw new Error('Failed to obtain access token');
        }
      } catch (error) {
        console.error('Error fetching access token:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    req.accessToken = accessToken;
    next();
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/recent-tracks', async (req, res) => {
  const token = refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await recetlyPlayedTracks(req, res, token)
})

app.get('/callback', async (req, res) => {
  
  let code = req.query.code || null;
  let state = req.query.state || null;
  loggedIn = code && state;
console.log("loggedIn", loggedIn)
  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    try {
      const data = new URLSearchParams();
      data.append('grant_type', 'authorization_code');
      data.append('redirect_uri', 'http://localhost:8080/spotify/callback');
      data.append('code', code);

      const config = {
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' +
            process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true
      };

      const response = await axios.post(tokenEndpoint, data, config);
      refreshToken = response.data.refresh_token

console.log('refreshToken ', refreshToken)
      if (response.status === 200) {
        res.json({ auth: response.data });
      } else {
        throw new Error('Failed to obtain access token');
      }
    } catch (error) {
      console.error('Error fetching access token:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

app.post('/refresh_token', async (req, res) => {
  try {
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', refreshToken);
  
    const config = {
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' +
          process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      json: true
    };
  
    const response = await axios.post(tokenEndpoint, data, config)

    refreshToken = response.data.access_token
    accessToken = response.data.access_token
    
    if (response.status === 200) {
      res.json({ 'access_token': response.data });
    } else {
      throw new Error('Failed to obtain access token');
    }
  } catch (err) {
    console.error('Error fetching refresh token:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});