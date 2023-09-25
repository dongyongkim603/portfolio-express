const axios = require('axios');
const btoa = require('btoa');

async function getBearerToken(req, res) {
  try {
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');
console.log(req.body)
    const authString = `1afde426b48347c7baacc526df092900:953ea612f6e14c5d86072707d8dc4bba`;
    const base64AuthString = btoa(authString); 

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + base64AuthString,
      },
    };

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      data,
      config
    );

    const accessToken = response.data.access_token;
    res.json({ access_token: accessToken });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports.getBearerToken = getBearerToken;