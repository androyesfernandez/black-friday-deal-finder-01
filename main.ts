// Black Friday Deal Finder — entry program (Node 22, standard library only).
//
// The site lives in this directory's app/ folder: plain static files that any
// static server can host with app/ at its root (index.html, one stylesheet,
// a few small ES modules, and the deals in their own data file). Nothing the
// site runs, styles or shows loads over the network; every deal links out to
// its store with a plain <a href>.
//
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json with the
// vendored make.fun library (buildDossier), exactly as the kit requires.
// Leave vendor/makefun-frontend.ts untouched: the scorer rebuilds the
// dossier with its own copy and compares the two byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly instead of handing in an empty site: the grader's sandbox
// gives no second chance, and a missing index.html would score 0.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing — refusing to build an empty entry');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the other limits refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 16 MiB of app files — app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
