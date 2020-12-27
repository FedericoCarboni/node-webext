// @ts-check
'use strict';

const path = require('path');
const fs = require('fs');

const gulp = require('gulp');

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

gulp.task('launch', async () => {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments(`--load-extension=${path.join(__dirname, 'test/integration')}`)
  const prefs = new webdriver.logging.Preferences();
  prefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);
  const builder = new webdriver.Builder()
    .forBrowser('chrome')
    .setLoggingPrefs(prefs)
    .setChromeOptions(chromeOptions)
    .setChromeService(new chrome.ServiceBuilder(chromedriver.path));
  const driver = await builder.build();
  console.log(await driver.manage().logs().get('browser'))
});
