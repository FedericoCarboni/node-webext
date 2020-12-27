import os from 'os';

describe('args', () => {
  let processSpy: jest.SpyInstance<NodeJS.Platform, []>;
  const argv = process.argv;
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.argv = argv;
    processSpy = jest.spyOn(os, 'platform');
  });
  const mockArgv = (args: string[]) => {
    process.argv = [...argv.slice(0, 2), ...args];
  };
  it('should work with Chrome extensions', () => {
    mockArgv(['chrome-extension://haeedinojonedameggoleemhcjfbafdc/']);
    const { extension, isNativeMessaging, isChrome } = require('../src/args');
    expect(extension).toBe('chrome-extension://haeedinojonedameggoleemhcjfbafdc/');
    expect(isNativeMessaging).toBe(true);
    expect(isChrome).toBe(true);
  });
  it('should work with Chrome extensions on Windows', () => {
    processSpy.mockImplementation(() => 'win32');
    mockArgv(['chrome-extension://haeedinojonedameggoleemhcjfbafdc/', '--parent-window=20']);
    const { extension, isNativeMessaging, isChrome } = require('../src/args');
    expect(extension).toBe('chrome-extension://haeedinojonedameggoleemhcjfbafdc/');
    expect(isNativeMessaging).toBe(true);
    expect(isChrome).toBe(true);
  });
  it('should work with Chrome <54 extensions on Windows', () => {
    processSpy.mockImplementation(() => 'win32');
    mockArgv([
      '--parent-window=20',
      'chrome-extension://haeedinojonedameggoleemhcjfbafdc/'
    ]);
    const { extension, isNativeMessaging, isChrome } = require('../src/args');
    expect(extension).toBe('chrome-extension://haeedinojonedameggoleemhcjfbafdc/');
    expect(isNativeMessaging).toBe(true);
    expect(isChrome).toBe(true);
  });
  it('should work with Firefox extensions (email-like)', () => {
    mockArgv(['extension@example.com']);
    const { extension, isNativeMessaging, isChrome } = require('../src/args');
    expect(extension).toBe('extension@example.com');
    expect(isNativeMessaging).toBe(true);
    expect(isChrome).toBe(false);
  });
  it('should work with Firefox extensions (GUID)', () => {
    mockArgv(['{daf44bf7-a45e-4450-979c-91cf07434c3d}']);
    const { extension, isNativeMessaging, isChrome } = require('../src/args');
    expect(extension).toBe('{daf44bf7-a45e-4450-979c-91cf07434c3d}');
    expect(isNativeMessaging).toBe(true);
    expect(isChrome).toBe(false);
  });
  it('should work with no extensions', () => {
    mockArgv(['--parent-window=20', '--parent-window=20']);
    const { extension, isNativeMessaging, isChrome } = require('../src/args');
    expect(extension).toBeUndefined();
    expect(isNativeMessaging).toBe(false);
    expect(isChrome).toBe(false);
  });
});
