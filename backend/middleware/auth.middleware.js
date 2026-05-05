const express = require('express');
const jwt = require('jsonwebtoken')
const authmidlware = express();

authmidlware.use((req, res, next) => {
    const authHeader = req.header['Autherization'];
    const token = authHeader && authHeader.split(' ')[1]
    console.log(authHeader);
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "access denied"
        })
    }
    try {
        const decodedinfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
        res.userInfo = decodedinfo;
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "access denied"
        })
    }

})