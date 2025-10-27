const fs = require('fs');
const path = require('path');

function getCommitSha() {
  const envSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.COMMIT_SHA;
  if (envSha) return envSha;
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    return '';
  }
}

const info = {
  commit: getCommitSha(),
  date: new Date().toISOString()
};

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'version.json');
fs.writeFileSync(outPath, JSON.stringify(info, null, 2));
console.log('Wrote version.json:', info);
