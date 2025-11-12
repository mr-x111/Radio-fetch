const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json/stations/search';

app.get('/api/search', async (req, res) => {
  try {
    const { station } = req.query;

    if (!station) {
      return res.status(400).json({
        success: false,
        message: 'Station name is required'
      });
    }

    const apiResponse = await axios.get(RADIO_BROWSER_API, {
      params: {
        name: station,
        limit: 100,
        hidebroken: true,
        order: 'votes',
        reverse: true
      },
      timeout: 10000
    });

    if (!apiResponse.data || apiResponse.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No stations found'
      });
    }

    const stations = apiResponse.data.map(stationInfo => ({
      name: stationInfo.name,
      url: stationInfo.url_resolved || stationInfo.url,
      country: stationInfo.country,
      language: stationInfo.language
    })).filter(station => station.url);

    res.json({
      success: true,
      searchQuery: station,
      totalStations: stations.length,
      stations: stations
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
