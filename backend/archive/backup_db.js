const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './backend/.env' });

/**
 * DATABASE BACKUP SYSTEM
 * This script creates a timestamped SQL dump of the entire database.
 * Use with a task scheduler (cron/Windows Task Scheduler) for automated backups.
 */

const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `LMS_Backup_${timestamp}.sql`;
const filePath = path.join(backupDir, filename);

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST || 'localhost';

// Construct mysqldump command
// Note: Requires mysqldump to be in the system PATH
const cmd = `mysqldump -u ${dbUser} ${dbPass ? `-p${dbPass}` : ''} -h ${dbHost} ${dbName} > "${filePath}"`;

console.log(`🚀 Starting database backup for [${dbName}]...`);

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    return;
  }
  if (stderr && !stderr.includes('Using a password')) {
    console.warn(`⚠️ Warning: ${stderr}`);
  }

  console.log(`✅ Backup successful!`);
  console.log(`📂 Saved to: ${filePath}`);

  // Auto-cleanup: Delete backups older than 30 days
  const files = fs.readdirSync(backupDir);
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  files.forEach(file => {
    const p = path.join(backupDir, file);
    const stats = fs.statSync(p);
    if (now - stats.mtimeMs > thirtyDays) {
      fs.unlinkSync(p);
      console.log(`🧹 Deleted old backup: ${file}`);
    }
  });
});
