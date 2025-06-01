const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {createCronJob,stopCronJob,restoreCronJob,recreateCronJob} = require('./cronjob');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

createCronJob();

app.delete('/api/logs', (req, res) => {
  db.query('DELETE FROM cron_task', (err, result) => {
    if (err) {
      console.error('Error clearing logs:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'All logs cleared' });
  });
});

app.post('/api/stop', (req, res) => {
  stopCronJob();
  res.json({ message: 'Cron job stopped' });
});

app.post('/api/restore', (req, res) => {
  restoreCronJob();
  res.json({ message: 'Cron job restored' });
});

app.post('/api/recreate', async (req, res) => {
  try {
    await recreateCronJob();
    res.json({ message: 'Cron job recreated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/logs', (req, res) => {
  db.query('SELECT * FROM cron_task ORDER BY id DESC LIMIT 10', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({logs : results});
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
