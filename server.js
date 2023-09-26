const express = require('express');
const http = require('http');
const querystring = require('querystring');
const btoa = require('btoa');
const axios = require('axios');
const cors = require ('cors')

const { recetlyPlayedTracks } = require('./spotify');

const app = express();

// const corsOptions = {
//   origin: 'http://localhost:3000',
// };

const tokenEndpoint = 'https://accounts.spotify.com/api/token';

app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let accessToken = null;

app.use(async (req, res, next) => {
  if (!accessToken) {
    try {
      const data = new URLSearchParams();
      data.append('grant_type', 'client_credentials');
      const authString = `${req.body.clientSecret}:${req.body.clientId}`;
      const base64AuthString = btoa(authString); 

      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + base64AuthString,
        },
      };

      const response = await axios.post(tokenEndpoint, data, config);
console.log(response)
      if (response.status === 200) {
        accessToken = response.data.access_token;

        // Set a timer to clear the access token after it expires
        const expiresInMilliseconds = response.data.expires_in * 1000;
        setTimeout(() => {
          accessToken = null;
        }, expiresInMilliseconds);
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
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


app.post('/recent-tracks', async (req, res) => {
  const token = req.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await recetlyPlayedTracks(req, res)
})
