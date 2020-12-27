// Streams read() is limited to 1GiB
// https://nodejs.org/api/stream.html#stream_readable_read_size
const SIZE_LIMIT = 1024 * 1024 * 1024;

export const read = (readable: NodeJS.ReadableStream, size: number): Promise<Uint8Array> => new Promise<Uint8Array>((resolve) => {
  let onReadable: () => void;
  if (size > SIZE_LIMIT) {
    // If more than 1GiB is requested, read it in multiple chunks.
    let currentSize = size;
    const chunks: Uint8Array[] = [];
    onReadable = () => {
      while (currentSize !== 0) {
        const readSize = currentSize > SIZE_LIMIT ? SIZE_LIMIT : currentSize;
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

export const write = (writable: NodeJS.WritableStream, u8: Uint8Array) => new Promise<void>((resolve, reject) => {
  writable.write(u8, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});
