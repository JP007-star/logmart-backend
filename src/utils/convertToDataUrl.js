const axios = require('axios');

// Utility function to convert image URLs to base64
const convertToDataUrl = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to Data URL:', error);
    throw new Error('Failed to convert image to Data URL');
  }
};

module.exports = {
  convertToDataUrl,
};
