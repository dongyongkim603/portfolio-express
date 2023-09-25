const express = require('express');
const cors = require('cors');

const { getBearerToken } = require('./spotify');

const app = express();

const corsOptions = {
  origin: 'http://localhost:8080',
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


app.post('/get-spotify-token', async (req, res) => {
  await getBearerToken(req, res)
})
