const express = require('express');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const { signup, signin, signout } = require('../controllers/auth');
const { requireSigin } = require('../middleware/index');
const { isRequestValidated, validateSignUpRequest, validateSignInRequest } = require('../validators/auth');

const router = express.Router();

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/signin', validateSignInRequest, isRequestValidated, signin);

router.post('/signup', upload.single('profilePicture'), validateSignUpRequest, isRequestValidated, signup);

router.post('/signout', signout);

router.post('/profile', requireSigin, (req, res) => {
    res.status(200).json({ user: "profile" });
});

module.exports = router;
