import { lstat, rm } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(projectRoot, 'dist');
const relativeOutput = relative(projectRoot, output);

if (!relativeOutput || relativeOutput.startsWith('..') || relativeOutput.includes('..')) {
  throw new Error('Build output is outside the project directory.');
}

try {
  if ((await lstat(output)).isSymbolicLink()) {
    throw new Error('Build output must not be a symbolic link.');
  }
  await rm(output, { recursive: true, force: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
