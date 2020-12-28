
const read = async (reader: Deno.Reader, size: number) => { const u8 = new Uint8Array(size); await reader.read(u8); return u8; };
// Copyright (c) 2020 Federico Carboni, MIT license
// Deno build

// The native messaging protocol requires to use the native endianness for the.
// https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host-protocol
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView#Endianness
const isLittleEndian = (() => {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
})();

// Some default values
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const defaultEncode = (text: string) => encoder.encode(text);
const defaultDecode = (u8: Uint8Array) => decoder.decode(u8);

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#App_side
// Messages sent to the extension are limited to 1MB
const MAX_OUTGOING_SIZE = 1_000_000;
// Messages coming from the extension are limited to 4GB
const MAX_INCOMING_SIZE = 4_000_000_000;

export interface SendOptions<T> {
  /** A writable stream to override stdout, defaults to `Deno.stdout`. */
  stdout?: Deno.Writer;
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
export async function send<T = unknown>(message: T, options: SendOptions<T> = {}): Promise<void> {
  const {
    stringify = JSON.stringify,
    stdout = Deno.stdout,
    encode = defaultEncode,
  } = options;

  const u8 = encode(stringify(message));

  const size = u8.byteLength;

  if (size > MAX_OUTGOING_SIZE)
    throw new RangeError('Cannot send message, an outgoing message may not exceed 1MB');

  const sizeU8 = new Uint8Array(4);
  new DataView(sizeU8.buffer).setUint32(0, size, isLittleEndian);

  await stdout.write(sizeU8);
  await stdout.write(u8);
}

export interface RecvOptions<R> {
  /**
   * Limit in bytes of the size of the message, defaults to `4GB`. Since browsers impose a `4GB`
   * limit, higher values are meaningless.
   * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#App_side
   */
  maxSize?: number;
  /** A readable stream to override stdin, defaults to `Deno.stdin`. */
  stdin?: Deno.Reader;
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
export async function recv<R = unknown>(options: RecvOptions<R> = {}): Promise<R> {
  const {
    maxSize = MAX_INCOMING_SIZE,
    parse = JSON.parse,
    stdin = Deno.stdin,
    decode = defaultDecode,
  } = options;

  const sizeU8 = await read(stdin, 4);
  const size = new DataView(sizeU8.buffer).getUint32(0, isLittleEndian);

  if (size > maxSize)
    throw new RangeError(`Cannot read message, size limit (${maxSize} bytes) exceeded `);

  const u8 = await read(stdin, size);
  return parse(decode(u8));
}
