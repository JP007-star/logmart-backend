const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVJnHZFEf1XUAGanvNwaZpotfcvt-pbmc",
  authDomain: "logmart-4d87b.firebaseapp.com",
  projectId: "logmart-4d87b",
  storageBucket: "logmart-4d87b.appspot.com",
  messagingSenderId: "871379367366",
  appId: "1:871379367366:web:2cd6ad540f78aa8c146ec7",
  measurementId: "G-RSBNZWS52Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Uploads an image to Firebase Storage and returns the URL of the uploaded image.
 * @param {File} imageFile - The image file to be uploaded.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded image.
 */
const uploadImage = async (imageFile) => {
  const storageRef = ref(storage, `products/${uuidv4()}_${imageFile.name}`);
  await uploadBytes(storageRef, imageFile);
  const imageUrl = await getDownloadURL(storageRef);
  return imageUrl;
};

/**
 * Generates a QR code for a given product ID, uploads it to Firebase Storage, and returns the URL.
 * @param {string} productId - The product ID to generate the QR code for.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded QR code image.
 */
const generateAndUploadQRCode = async (productId) => {
  try {
    // Generate QR code as a PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(productId, { type: 'image/png' });

    // Generate a unique file name for the QR code image
    const uniqueFileName = `qrcodes/${uuidv4()}_${productId}.png`;

    // Create a reference to the storage location
    const storageRef = ref(storage, uniqueFileName);

    // Upload the QR code image buffer
    await uploadBytes(storageRef, qrCodeBuffer, { contentType: 'image/png' });

    // Get the download URL of the uploaded QR code image
    const qrCodeUrl = await getDownloadURL(storageRef);

    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating or uploading QR code:', error);
    throw new Error('Failed to generate or upload QR code');
  }
};

module.exports = { uploadImage, generateAndUploadQRCode };
