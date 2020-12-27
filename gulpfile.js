// @ts-check
'use strict';

const path = require('path');

const gulp = require('gulp');
const header = require('gulp-header');
const ts = require('gulp-typescript');

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

const tsTestProject = ts.createProject('test/integration/tsconfig.json');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('launchChrome', async () => {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments(`--load-extension=${path.join(__dirname, 'test/integration/chrome')}`)
  const prefs = new webdriver.logging.Preferences();
  prefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);
  const builder = new webdriver.Builder()
    .forBrowser('chrome')
    .setLoggingPrefs(prefs)
    .setChromeOptions(chromeOptions)
    .setChromeService(new chrome.ServiceBuilder(chromedriver.path));
  const driver = await builder.build();
  console.log(await driver.manage().logs().get('browser'))
  await driver.get('chrome-extension://heonnfeanoemkaemiiapohafcocoapnn/tests.html');
});

gulp.task('buildTests', gulp.series(function moveMochaAndChai() {
  return gulp.src([
    'node_modules/mocha/mocha.js',
    'node_modules/mocha/mocha.css',
    'node_modules/chai/chai.js'
  ])
  .pipe(gulp.dest('test/integration/chrome/vendor'))
  .pipe(gulp.dest('test/integration/firefox/vendor'));
}, function build() {
  return tsTestProject.src()
    .pipe(tsTestProject())
    .pipe(gulp.dest('test/integration/chrome'))
    .pipe(gulp.dest('test/integration/firefox'));
}, function buildIntegration() {
  return gulp.src(['src/**/*.ts', 'test/integration/app.ts'])
    .pipe(tsProject())
    .pipe(header(`#!${process.argv[0]}\n`))
    .pipe(gulp.dest('test/integration/app'));
}));

gulp.task('test:chrome', gulp.series('buildTests', 'launchChrome'));
