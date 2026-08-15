import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await mkdir('dist/contracts', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src/main.js', 'dist/src/main.js');
await cp('src/styles.css', 'dist/src/styles.css');
await cp('contracts/status.json', 'dist/contracts/status.json');
console.log('Built static site into dist/');
