import { assert, assertEquals, assertStrictEquals, assertThrowsAsync } from 'https://deno.land/std@0.82.0/testing/asserts.ts';
import { deferred } from 'https://deno.land/std@0.82.0/async/deferred.ts';
import { endianness } from 'https://deno.land/std@0.82.0/node/os.ts';
import { recv, send } from './io.ts';

Deno.test('send() throws RangeError when >1MB', async () => {
  const written = deferred();
  const error = await assertThrowsAsync(() => send({
    message: 'A'.repeat(1000000),
  }, {
    stdout: {
      write() {
        written.reject(new Error('Expected send() not to write bytes'));
        throw new Error();
      },
    },
  }));
  written.resolve();
  await written;
  assert(error instanceof RangeError);
});
Deno.test('recv() throws RangeError when >4GB', async () => {
  const read = deferred();
  const mockStdin: Deno.Reader = {
    read: async (u8) => {
      assertEquals(u8.byteLength, 4);
      new DataView(u8.buffer).setUint32(0, 4_000_000_001, endianness() === 'LE');
      mockStdin.read = () => {
        read.reject(new Error('Expected recv() not to read bytes'));
        throw new Error();
      };
      return u8.byteLength;
    },
  };
  const error = await assertThrowsAsync(() => recv({ stdin: mockStdin }));
  read.resolve();
  await read;
  assert(error instanceof RangeError);
});
Deno.test('send() and recv()', async () => {
  let promise = deferred<Uint8Array>();
  const mockStdin: Deno.Reader = {
    async read(p) {
      const u8 = await promise;
      p.set(u8, 0);
      return p.byteLength;
    }
  };
  const mockStdout: Deno.Writer = {
    async write(p) {
      promise.resolve(p);
      if (p.byteLength === 4)
        promise = deferred<Uint8Array>();
      return p.byteLength;
    }
  };
  const recvPromise = recv<any>({ stdin: mockStdin });
  await send({ message: 'if you can read me it worked' }, { stdout: mockStdout });
  assertStrictEquals((await recvPromise).message, 'if you can read me it worked');
  await promise;
});
