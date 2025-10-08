const axios = require('axios');
const HttpError = require('./http-error');

async function getCoordsForAddress(address) {
    const baseUrl = process.env.NOMINATIM_URL;
    const url = `${baseUrl}?q=${encodeURIComponent(address)}&format=geojson`;

    const response = await axios.get(url, {
        headers: { "User-Agent": "my-app" } // Nominatim requires this
    });

    const data = response.data;

    if (!data || !data.features || data.features.length === 0) {
        throw new HttpError('Could not find location for the specified address.', 422);
    }

    const [lng, lat] = data.features[0].geometry.coordinates;

    return { lat, lng };
}

module.exports = getCoordsForAddress;
