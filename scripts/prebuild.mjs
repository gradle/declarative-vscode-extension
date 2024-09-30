/**
 * This script runs before the build script.
 * See "package.json" and ".vscode/tasks.json" to see the invocation of this script.
 */

import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { Buffer } from 'buffer';

const LSP_JAR_URL = "https://gradle.github.io/declarative-lsp/lsp-all.jar"

function createLibsDir() {
  const out_dir = path.resolve('./libs');
  if (!fs.existsSync(out_dir)) {
    fs.mkdirSync(out_dir);
  }
  return out_dir;
}

async function fetchLspJar(dir) {
  const lspJarPath = path.resolve(dir, 'lsp-all.jar');
  const response = await fetch(LSP_JAR_URL);
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(lspJarPath, Buffer.from(arrayBuffer));
  console.log(`Downloaded LSP Jar to ${lspJarPath}`);
}

const out_dir = path.resolve('./libs');
if (!fs.existsSync(out_dir)) {
  fs.mkdirSync(out_dir);
}

const libsDir = createLibsDir();
await fetchLspJar(libsDir);