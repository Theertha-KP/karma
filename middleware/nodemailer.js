const express = require('express');
const app = express();
const port = 3000;
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.useremail,
        pass: process.env.password
    }
});

const secret = speakeasy.generateSecret({ length: 20 });

app.post('/send-otp', (req, res) => {
   
    const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
    });

    const mailOptions = {
        from: 'theerthatkp28@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for verification is: ${otp}`
    };

   
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(otp);
            console.log(error.message);
            console.log(email);
            return res.status(500).json({ error: 'Failed to send OTP' });
        }

        res.json({ success: true, message: 'OTP sent successfully' });
    });
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    const isValid = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token: otp,
        window: 1
    });

    if (isValid) {
        res.json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
