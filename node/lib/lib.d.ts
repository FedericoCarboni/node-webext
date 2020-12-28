/// <reference types="node"/>
export declare const isChrome: boolean;
export declare const isNativeMessaging: boolean;
export declare const extension: string | undefined;
export interface SendOptions<T> {
  /** Override stdout, defaults to `process.stdout`. */
  stdout?: NodeJS.WritableStream;
  /** Custom stringify function, defaults to `JSON.stringify` */
  stringify?(value: T): string;
  /** Override the default text encoder */
  encode?(text: string): Uint8Array;
}
/**
 * Send a message to the extension.
 * @template T The type of the message to send.
 * @param message - A message to send to the extension.
 * @param options - Advanced options for more customization, {@link SendOptions}.
 * @throws `RangeError` if the length of the encoded message exceeds `1MB`,
 * {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#App_side}.
 */
export declare function send<T = unknown>(message: T, options?: SendOptions<T>): Promise<T>;
export interface RecvOptions<R> {
  /**
   * Limit in bytes of the size of the message, defaults to `4GB`. Since browsers impose a `4GB`
   * limit, higher values are meaningless.
   * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#App_side
   */
  maxSize?: number;
  /** Override stdin, defaults to `process.stdin`. */
  stdin?: NodeJS.ReadableStream;
  /** Custom parse function, defaults to `JSON.parse` */
  parse?(text: string): R;
  /** Override the default text decoder */
  decode?(u8: Uint8Array): string;
}
/**
 * Receive one message from the extension.
 * @template R The type of the message to receive.
 * @param options - Advanced options, for more customizable behavior {@link RecvOptions}.
 * @throws `RangeError` if the length of the encoded message is greater than `options.maxSize` {@link RecvOptions}.
 */
export declare function recv<R = unknown>(options?: RecvOptions<R>): Promise<R>;
