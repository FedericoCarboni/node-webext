// Copyright (c) 2020 Federico Carboni, MIT license

// This module is a proxy for read and write operations,
// so that they can easily be replaced in the Node.js build.

/**
 * Read a specified number of bytes from a `Deno.Reader` into a new `Uint8Array`.
 * @internal
 */
export const _read = async (reader: Deno.Reader, size: number) => {
  const u8 = new Uint8Array(size);
  await reader.read(u8);
  return u8;
};

/**
 * Write to a `Deno.Writer`.
 * @internal
 */
export const _write = (writer: Deno.Writer, u8: Uint8Array) => writer.write(u8);
