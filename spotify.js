const axios = require('axios');

async function recetlyPlayedTracks(req, res, token) {

  const config = {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  }

  await axios.get('https://api.spotify.com/v1/me/top/artists', config)
    .then((response) => {
      console.log(response)
      res.json({ recent_tracks: response.data });
    })
    .catch((error) => {
      console.error(error.message)
      res.status(500).json({ error: 'Internal Server Error' });
    });
}

module.exports.recetlyPlayedTracks = recetlyPlayedTracks;