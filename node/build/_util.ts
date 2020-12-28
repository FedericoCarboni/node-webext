// Streams read() has a hard limit of 1GiB
// https://nodejs.org/api/stream.html#stream_readable_read_size
const NODEJS_READ_LIMIT = 1073741824;

/**
 * Read a specified number of bytes from a stream.
 * @param readable - The readable stream to read from.
 * @param size - The number of bytes to read.
 * @internal
 */
export const _read = (readable: NodeJS.ReadableStream, size: number) => new Promise<Uint8Array>((resolve) => {
  let onReadable: () => void;
  if (size > NODEJS_READ_LIMIT) {
    // More than 1GiB is to be read.
    let currentSize = size;
    const chunks: Uint8Array[] = [];
    onReadable = () => {
      // Read the stream in chunks.
      while (currentSize !== 0) {
        const readSize = currentSize > NODEJS_READ_LIMIT ? NODEJS_READ_LIMIT : currentSize;
        const u8 = readable.read(readSize) as Uint8Array;
        if (u8 !== null) {
          chunks.push(u8);
          currentSize -= readSize;
        }
      }
      resolve(Buffer.concat(chunks));
      unlisten();
    };
  } else {
    onReadable = () => {
      const u8 = readable.read(size) as Uint8Array;
      if (u8 !== null) {
        resolve(u8);
        unlisten();
      }
    };
  }
  const unlisten = () => {
    readable.off('readable', onReadable);
  };
  readable.on('readable', onReadable);
});

/**
 * Promise wrapper for `stream.write()`.
 * @param writable - The writable stream to write to.
 * @param u8 - The data to write.
 * @internal
 */
export const _write = (writable: NodeJS.WritableStream, u8: Uint8Array) => new Promise<void>((resolve, reject) => {
  writable.write(u8, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});
