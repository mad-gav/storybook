const fs = require('fs');
const path = require('path');

const { run, copyDirSync } = require('../helpers');

const fixturesDirPath = path.join(__dirname, '..', 'fixtures');
const runDirPath = path.join(__dirname, '..', 'run');

const rootPath = path.join(__dirname, '..', '..', '..', '..');

jest.setTimeout(240000);

beforeAll(() => {
  fs.mkdirSync(runDirPath);
  // Copy all files from fixtures directory to `run`
  const dirs = fs.readdirSync(fixturesDirPath);
  dirs.forEach(dir => copyDirSync(path.join(fixturesDirPath, dir), runDirPath));
});

describe('sb init', () => {
  it('init scaffolds', () => {
    const dirs = fs.readdirSync(runDirPath);
    dirs.forEach(dir => {
      run(['init', '--skip-install', 'yes'], { cwd: path.join(runDirPath, dir) });
    });

    // Install all the dependencies in a single run
    console.log('Running bootstrap');
    run(['yarn install', '--non-interactive', '--silent', '--pure-lockfile'], { cwd: rootPath });

    // Check that storybook starts without errors
    dirs.forEach(dir => {
      console.log(`Running smoke test in ${dir}`)
      const { status } = run(['yarn', 'storybook', '--smoke-test', '--quiet'], { cwd: path.join(runDirPath, dir) });
      expect(status).toBe(0);
    });
  });
})
