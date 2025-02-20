const express = require('express');
const { ROLE } = require('../constants');
const { generateToken } = require('../utils/authUtils');

const router = express.Router();

// Route to authenticate user and generate jwt token
router.post('/authenticate', async (req, res) => {
    try {
        const { username, password } = req.body;

        // TODO: implement proper function to authenticate user
        const userdata = {
            username,
            role: ROLE.USER
        };

        if (password == 'test') {
            const token = generateToken(userdata, ROLE.USER);
            res.json({ userData: userdata, token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (e) {
        res.status(500).send(`Login failed: ${e.message}`);
    }
});

module.exports = router;