const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;
app.use(bodyParser.json());

const USERS_FILE = path.join(__dirname, 'Users.json');

// Utility: Generate random password
function generatePassword(length = 10) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Utility: Read users
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Utility: Write users
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// 📩 Send password email
async function sendPasswordEmail(email, password) {
  const mailOptions = {
    from: `"OneDev Registration" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OneDev Account Password',
    html: `
      <div style="max-width:600px;margin:auto;font-family:sans-serif;padding:30px;border:1px solid #ccc;border-radius:10px;background:#f9f9f9;">
        <h2 style="text-align:center;color:#222;">🔐 Your OneDev Account Password</h2>
        <p style="text-align:center;color:#333;">Temporary Password:</p>
        <h1 style="text-align:center;color:#dc3545;">${password}</h1>
        <p style="text-align:center;color:#555;">Please change it after your first login</p>
        <hr>
        <p style="font-size:12px;text-align:center;color:#aaa;">If you did not register, ignore this email.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
}

// ✅ REGISTER
app.post('/register', async (req, res) => {
  const {
    name, email, phone, github_url, linkedin_url,
    organization, user_role, applied_role, actual_role
  } = req.body;

  if (!email || !name) return res.status(400).json({ error: 'Name and Email are required' });

  const users = await readUsers();
  if (users[email]) return res.status(400).json({ error: 'User already exists' });

  const password = generatePassword(10);
  const password_hash = await bcrypt.hash(password, 10);
  const created_at = new Date().toISOString();
  const id = crypto.randomUUID();

  users[email] = {
    id, name, email, phone, github_url, linkedin_url,
    organization, user_role, applied_role, actual_role,
    password_hash, created_at
  };

  try {
    await writeUsers(users);
    await sendPasswordEmail(email, password);
    res.status(200).json({ message: 'User registered and password emailed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 OneDev auth server running at http://localhost:${PORT}`);
});
