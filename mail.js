const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.post('/send-password', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const mailOptions = {
    from: `"OneDev Registration" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OneDev Account Password',
    html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; padding-bottom: 20px;">
          <h2 style="color: #222;">🔑 Your Account Password</h2>
          <p style="color: #555;">Please keep this information confidential</p>
        </div>
        <div style="background-color: #fff; padding: 25px; border-radius: 8px; border: 1px dashed #dc3545; text-align: center;">
          <p style="font-size: 16px; color: #333;">Your temporary account password is:</p>
          <h1 style="font-size: 32px; color: #dc3545; margin: 10px 0;">${password}</h1>
          <p style="font-size: 14px; color: #888;">We recommend changing it after your first login</p>
        </div>
        <div style="margin-top: 30px; font-size: 15px; color: #555;">
          <p>Do <strong>not</strong> share this password with anyone. OneDev will never ask you to disclose your password via email or chat.</p>
          <p>If you did not request this password, please reset your account password immediately or contact our support team.</p>
        </div>
        <div style="margin-top: 40px; text-align: center; color: #999; font-size: 13px;">
          <p>— The OneDev Security Team</p>
          <p><a href="mailto:support@onedevplatform.com" style="color: #007bff; text-decoration: none;">support@onedevplatform.com</a></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ error: 'Failed to send password email' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
