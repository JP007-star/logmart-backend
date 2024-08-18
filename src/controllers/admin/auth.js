const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const shortid = require('shortid');
const User = require('../../models/User.js');

exports.signup = async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const { firstName, lastName, email, password } = req.body;
        const hash_password = await bcrypt.hash(password, 10);

        const _user = new User({
            firstName,
            lastName,
            email,
            hash_password,
            username: shortid.generate(),
            role: 'admin'
        });

        const savedUser = await _user.save();

        return res.status(200).json({
            user: savedUser,
            message: 'Admin User created Successfully...!'
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

exports.signin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user || !(await user.authenticate(req.body.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const { _id, firstName, lastName, email, role, fullName } = user;

        res.cookie('token', token, { expiresIn: '1m' });

        return res.status(200).json({
            token,
            user: {
                _id,
                firstName,
                lastName,
                email,
                role,
                fullName
            }
        });
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

exports.signout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        message: 'SignOut Successfully ....!'
    });
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '_id firstName lastName email role profilePicture fullName username');

        return res.status(200).json({
            users,
            message: 'All users retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};


exports.getOneUserByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username }, '_id firstName lastName username profilePicture email role');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            user,
            message: 'User retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};


exports.getOneUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId, '_id firstName lastName email role profilePicture');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            user,
            message: 'User retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            user: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};




exports.updatePassword = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { currentPassword, newPassword } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        // Check if the current password provided matches the user's current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.hash_password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Current password is incorrect'
            });
        }

        // Hash the new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.hash_password = newHashedPassword;

        // Save the updated user
        await user.save();

        return res.status(200).json({
            message: 'Password updated successfully'
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};







