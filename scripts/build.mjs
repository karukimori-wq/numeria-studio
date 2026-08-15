import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

const appName = 'numeria-studio';
const appVersion = '0.1.0';
const contractVersion = '0.1.0';
const timestamp = new Date().toISOString();

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await mkdir('dist/contracts', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src/main.js', 'dist/src/main.js');
await cp('src/styles.css', 'dist/src/styles.css');
await cp('contracts/status.json', 'dist/contracts/status.json');
await cp('contracts/status.json', 'dist/contracts/status');
await writeFile('dist/health', `${JSON.stringify({ appName, status: 'ok', timestamp }, null, 2)}\n`);
await writeFile('dist/version', `${JSON.stringify({ appName, appVersion, contractVersion, commitSha: 'optional', timestamp }, null, 2)}\n`);
console.log('Built static site into dist/');
