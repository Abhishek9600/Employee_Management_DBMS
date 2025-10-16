const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const backupDatabase = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.sql`;
  const backupPath = path.join(__dirname, '..', 'backups', backupFile);

  // Ensure backups directory exists
  const backupsDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const command = `pg_dump -U postgres -d employee_management -f "${backupPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Backup failed:', error);
      return;
    }
    console.log(`Backup created: ${backupFile}`);
  });
};

backupDatabase();