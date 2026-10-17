require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const careerRoutes = require('./routes/careerRoutes');
const githubRoutes = require('./routes/githubRoutes');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerOS API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/github', githubRoutes);

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
