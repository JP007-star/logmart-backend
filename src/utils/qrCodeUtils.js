const QRCode = require('qrcode');
const { createWriteStream } = require('fs');
const { join } = require('path');

/**
 * Generates a QR code image as a buffer.
 * @param {object} data - The data to encode in the QR code.
 * @returns {Promise<Buffer>} - A promise that resolves to a buffer of the QR code image.
 */
const generateQRCode = async (data) => {
  try {
    // Generate QR Code and get as a buffer
    const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(data), {
      type: 'png',
      width: 300
    });
    
    // Save buffer to a temporary file (optional, for local testing)
    // const filePath = join(__dirname, 'temp', 'qrcode.png');
    // await fs.promises.writeFile(filePath, qrCodeBuffer);
    
    return qrCodeBuffer;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateQRCode };
