chrome.runtime.sendNativeMessage('myapp', { nativeMessage: 2 }, console.log);
const port = chrome.runtime.connectNative('myapp');
port.postMessage({ nativeConnect: 2 });
