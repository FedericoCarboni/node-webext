// Copyright (c) 2020 Federico Carboni, MIT license
// Deno build
export { isNativeMessaging, isChrome, extension } from './args.ts';
export { send, recv } from './io.ts';
export type { SendOptions, RecvOptions } from './io.ts';
