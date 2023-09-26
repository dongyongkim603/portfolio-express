const express = require('express');
const http = require('http');
const querystring = require('querystring');
const btoa = require('btoa');
const axios = require('axios');
const cors = require ('cors')
require('dotenv').config()

const { recetlyPlayedTracks } = require('./spotify');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
};

const tokenEndpoint = 'https://accounts.spotify.com/api/token';

app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

let accessToken = null;

// app.use(async (req, res, next) => {
//   console.log('accessToken ', accessToken)
//   if (!accessToken) {
//     try {
//       const data = new URLSearchParams();
//       data.append('grant_type', 'authorization_code');
//       const authString = `${req.body.clientSecret}:${req.body.clientId}`;
//       const base64AuthString = btoa(authString); 

//       const config = {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           Authorization: 'Basic ' + base64AuthString,
//         },
//       };

//       const response = await axios.post(tokenEndpoint, data, config);

//       if (response.status === 200) {
//         accessToken = response.data.access_token;

//         const expiresInMilliseconds = response.data.expires_in * 1000;
//         setTimeout(() => {
//           accessToken = null;
//         }, expiresInMilliseconds);
//       } else {
//         throw new Error('Failed to obtain access token');
//       }
//     } catch (error) {
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }

//   req.accessToken = accessToken;
//   next();
// });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


app.post('/recent-tracks', async (req, res) => {
  const token = req.accessToken;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('recetlyPlayedTracks')
  await recetlyPlayedTracks(req, res)
})

app.get('/login', (req, res) => {
  var state = generateRandomString(16);
  try {
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        redirect_uri: 'http://localhost:3000/callback',
        state: state
      }))
  } catch (err) {
    console.log(err)
  }
});

function generateRandomString(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.get('/callback', (req, res) => {

  let code = req.query.code || null;
  let state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: 'http://localhost:3000/callback',
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' +
          process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
      },
      json: true
    };
  }
});

// app.get('/callback', function(req, res) {

//   var code = req.query.code || null;
//   var state = req.query.state || null;

//   if (state === null) {
//     res.redirect('/#' +
//       querystring.stringify({
//         error: 'state_mismatch'
//       }));
//   } else {
//     var authOptions = {
//       url: 'https://accounts.spotify.com/api/token',
//       form: {
//         code: code,
//         redirect_uri: redirect_uri,
//         grant_type: 'authorization_code'
//       },
//       headers: {
//         'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
//       },
//       json: true
//     };
//   }
// });