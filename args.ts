// Copyright (c) 2020 Federico Carboni, MIT license

const isWindows = Deno.build.os === 'windows';

// The first two arguments in Node.js are the node executable and the path to the main script.
const args = Deno.args;
const arg0 = args[0];

// Chrome <54 on Windows passes the origin as the second argument,
// the first argument is a handle to the calling chrome window.
const hasParentWindow = isWindows && arg0 !== void 0 && /^--parent-window=[0-9]+$/.test(arg0);

const ext = hasParentWindow ? args[1] : arg0;

// Chrome extension ids are formatted as `chrome-extension://haeedinojonedameggoleemhcjfbafdc/`.
const CHROME_EXTENSION_REGEX = /^chrome-extension:\/\/[a-z]{32}\/$/;
// Firefox ids can be formatted as an email (e.g. `extension@example.com`) or as a GUID.
const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
// Borrowed from https://github.com/uuidjs/uuid/blob/master/src/regex.js
const GUID_REGEX = /^\{[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\}$/;

/**
 * `true` if the app was launched with by a chrome-like browser Chrome, Chromium and higher
 * versions of Edge.
 */
export const isChrome = ext !== void 0 && CHROME_EXTENSION_REGEX.test(ext);

/**
 * `true` if the app was launched by a browser for a native messaging sessions.
 */
export const isNativeMessaging = isChrome || !hasParentWindow && ext !== void 0 &&
  (EMAIL_REGEX.test(ext) || GUID_REGEX.test(ext));

/**
 * The extension that originated the native messaging session. If Node.js wasn't launched in native
 * messaging mode it's `undefined`.
 */
export const extension = isNativeMessaging ? ext : void 0;
