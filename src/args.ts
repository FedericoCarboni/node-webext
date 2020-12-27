const isWindows = process.platform === 'win32';

// The first two arguments in Node.js are the node executable and the path to the main script.
const args = process.argv.slice(2);
const arg0 = args[0];

// Chrome <54 on Windows passes the origin as the second argument,
// the first argument is a handle to the calling chrome window.
const hasParentWindow = isWindows && arg0 !== void 0 && /^--parent-window=[0-9]+$/.test(arg0);

const extensionId = hasParentWindow ? args[1] : arg0;

// Chrome extension ids are formatted as `chrome-extension://haeedinojonedameggoleemhcjfbafdc/`
const CHROME_EXTENSION_REGEXP = /^chrome-extension:\/\/[a-z]{32}\/$/;
// Firefox extension ids can be formatted as an email `addon@example.com` or as a GUID
const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
// Borrowed from https://github.com/uuidjs/uuid/blob/master/src/regex.js
const GUID_REGEXP = /^\{[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\}$/;

/**
 * Whether the
 */
export const isChrome = extensionId !== void 0 && CHROME_EXTENSION_REGEXP.test(extensionId);

/**
 *
 */
export const isWebExt = !isChrome && !hasParentWindow && extensionId !== void 0 && (EMAIL_REGEXP.test(extensionId) || GUID_REGEXP.test(extensionId));

/**
 * Whether the
 */
export const isNativeMessaging = isChrome || isWebExt;

/**
 * The ID of the extension that originated the native messaging session. If Node.js wasn't launched
 * in native messaging mode it's `undefined`.
 */
export const extension = isNativeMessaging ? extensionId : void 0;
