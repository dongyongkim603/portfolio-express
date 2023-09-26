const axios = require('axios');

const tokenEndpoint = 'https://accounts.spotify.com/api/token';

async function getBearerToken(req, res) {
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
    console.log(data)

    const response = await axios.post(tokenEndpoint, data, config);
    if (response.status === 200) {
      const accessToken = response.data.access_token;
      res.json({ access_token: accessToken });
    } else {
      throw new Error('Failed to obtain access token');
    }
  } catch (error) {
    console.error('Error fetching access token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function recetlyPlayedTracks(req, res) {
  const config = {
    headers: {
      Authorization: 'Bearer ' + req.accessToken,
      'Content-Type': 'application/json'
    }
  };

  return axios.get('https://api.spotify.com/v1/me/player/recently-played', config)
    .then((response) => {
      res.json({ recent_tracks: response.data });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
}

module.exports.recetlyPlayedTracks = recetlyPlayedTracks;
module.exports.getBearerToken = getBearerToken;