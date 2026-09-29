import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { unpackProject } from './unpack-project.mjs';

function fixture() {
  const modules = [
    { id: 'scene', kind: 'html', files: ['scene.html'], source: '<main><h1>我的花园</h1></main>', dependsOn: [] },
    { id: 'style', kind: 'css', files: ['style.css'], source: 'body{color:green}', dependsOn: ['scene'] },
    { id: 'logic', kind: 'js', files: ['main.js'], source: 'globalThis.__SPROUT_UNPACK_EXECUTED = true;', dependsOn: ['style'] }
  ].map((module) => ({ title: module.id, description: 'A module', concept: 'A concept', challenge: 'A challenge', status: 'done', ...module }));
  return { id: 'fbd382ab-88e7-48dc-9774-8a049b6d492a', title: '我的花园', prompt: '创造一座花园', template: 'pet-care', provider: 'demo', modules, config: { accent: '#ffee88', speed: 1, target: 10, durationMinutes: 5, petName: '芽芽' }, html: '<!doctype html><html></html>', activity: [], createdAt: '2026-09-29T00:00:00.000Z', updatedAt: '2026-09-29T00:00:00.000Z' };
}
function setup(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sprout-unpack-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'download.json'), output = path.join(directory, 'new-project');
  const write = (project) => fs.writeFileSync(input, JSON.stringify(project));
  write(fixture());
  return { directory, input, output, write };
}

test('exports editable source and rebuilds changed HTML without executing JavaScript', (t) => {
  const { input, output } = setup(t);
  const result = unpackProject(input, output);
  assert.equal(result.builtModules, 3);
  assert.equal(fs.readFileSync(path.join(output, 'src/main.js'), 'utf8'), fixture().modules[2].source);
  assert.equal(globalThis.__SPROUT_UNPACK_EXECUTED, undefined);
  fs.writeFileSync(path.join(output, 'src/scene.html'), '<main><h1>新的花园</h1></main>');
  execFileSync(process.execPath, [path.join(output, 'build.mjs')]);
  const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  assert.match(html, /新的花园/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(fs.readFileSync(path.join(output, 'README.md'), 'utf8'), /#expert/);
  assert.equal(globalThis.__SPROUT_UNPACK_EXECUTED, undefined);
});

test('rejects existing output directories and files without changing them', (t) => {
  const { input, output, directory } = setup(t);
  fs.mkdirSync(output);
  fs.writeFileSync(path.join(output, 'keep.txt'), 'keep');
  assert.throws(() => unpackProject(input, output), /new directory/);
  assert.equal(fs.readFileSync(path.join(output, 'keep.txt'), 'utf8'), 'keep');
  const file = path.join(directory, 'file'); fs.writeFileSync(file, 'keep');
  assert.throws(() => unpackProject(input, file), /new directory/);
  assert.equal(fs.readFileSync(file, 'utf8'), 'keep');
});

test('rejects symlink input, output and ancestors', (t) => {
  const { input, output, directory } = setup(t);
  const link = path.join(directory, 'download-link'); fs.symlinkSync(input, link);
  assert.throws(() => unpackProject(link, output), /Symlinks/);
  fs.symlinkSync(path.join(directory, 'missing'), output);
  assert.throws(() => unpackProject(input, output), /Symlinks/);
  const parentLink = path.join(directory, 'parent-link'); fs.symlinkSync(directory, parentLink);
  assert.throws(() => unpackProject(input, path.join(parentLink, 'child')), /Symlinks/);
});

test('rejects traversal, absolute paths, duplicates, device names and malformed schemas before writing', (t) => {
  const { input, output, write } = setup(t);
  const mutations = [
    (project) => { project.modules[0].files = ['../escape.html']; },
    (project) => { project.modules[0].files = ['/tmp/escape.html']; },
    (project) => { project.modules[1].kind = 'html'; project.modules[1].files = ['SCENE.html']; },
    (project) => { project.modules[0].files = ['CON.html']; },
    (project) => { project.modules[0].dependsOn = ['logic']; },
    (project) => { project.html = '../../secret'; },
    (project) => { project.config.accent = '</style>'; },
    (project) => { project.modules[2].source = 'const = broken'; }
  ];
  for (const mutate of mutations) {
    const project = fixture(); mutate(project); write(project);
    assert.throws(() => unpackProject(input, output));
    assert.equal(fs.existsSync(output), false);
  }
});

test('supports partial projects and completing a pending module during professional editing', (t) => {
  const { input, output, write } = setup(t);
  const project = fixture(); project.modules[2].status = 'ready'; project.modules[2].source = ''; write(project);
  unpackProject(input, output);
  assert.doesNotMatch(fs.readFileSync(path.join(output, 'index.html'), 'utf8'), /SPROUT_UNPACK_EXECUTED/);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'project.json'), 'utf8'));
  manifest.modules[2].status = 'done';
  fs.writeFileSync(path.join(output, 'project.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(output, 'src/main.js'), 'console.log("new behavior");');
  execFileSync(process.execPath, [path.join(output, 'build.mjs')]);
  assert.match(fs.readFileSync(path.join(output, 'index.html'), 'utf8'), /new behavior/);
});

test('rebuild rejects source symlinks and manifest paths before changing index.html', (t) => {
  const { input, output, directory } = setup(t); unpackProject(input, output);
  const before = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  const external = path.join(directory, 'external.js'); fs.writeFileSync(external, 'console.log("escape");');
  fs.unlinkSync(path.join(output, 'src/main.js')); fs.symlinkSync(external, path.join(output, 'src/main.js'));
  assert.throws(() => execFileSync(process.execPath, [path.join(output, 'build.mjs')], { stdio: 'pipe' }));
  assert.equal(fs.readFileSync(path.join(output, 'index.html'), 'utf8'), before);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'project.json'), 'utf8'));
  manifest.modules[2].files = ['../external.js']; fs.writeFileSync(path.join(output, 'project.json'), JSON.stringify(manifest));
  assert.throws(() => execFileSync(process.execPath, [path.join(output, 'build.mjs')], { stdio: 'pipe' }));
  assert.equal(fs.readFileSync(path.join(output, 'index.html'), 'utf8'), before);
});
