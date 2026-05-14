import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const outputDir = 'dist';
const filesToCopy = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'src',
  'assets',
];

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });

await Promise.all(
  filesToCopy.map((file) => cp(file, join(outputDir, file), { recursive: true })),
);

console.log(`Built static website in ${outputDir}/`);
