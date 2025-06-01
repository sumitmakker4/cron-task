const cron = require('node-cron');
const db = require('./database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

let job = null;

async function writeToTable() {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log('✅ Cron executed at', now);

  // Fire and forget - do NOT await this promise
  query('INSERT INTO cron_task (message, timestamp) VALUES (?, ?)', ['Cron ran at 12 AM', now])
    .then(result => console.log('✅ Row inserted:', result.insertId))
    .catch(err => console.error('❌ Error inserting into cron_task:', err));
}

function updateStatus(status) {
  db.query(
    'UPDATE cron_status SET status = ? WHERE id = 1',
    [status],
    (err) => {
      if (err) console.error('Error updating status:', err.message);
    }
  );
}

function createCronJob() {    
job = cron.schedule('* * * * *', writeToTable, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
  
  updateStatus('running');
}

function stopCronJob() {
  if (job) {
    job.stop();
    updateStatus('stopped');
  }
}

function restoreCronJob() {
  if (job) {
    job.start();
    updateStatus('running');
  }
}

async function recreateCronJob() {
  if (job) {
    job.destroy();
  }
  createCronJob();
  await writeToTable();
}


module.exports = {
  createCronJob,
  stopCronJob,
  restoreCronJob,
  recreateCronJob
};
