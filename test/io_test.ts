import { PassThrough } from 'stream';
import { send, recv } from '../src/io';

describe('io', () => {
  describe('send()', () => {
    it('should throw TypeError if stdout is not writable', async () => {
      const stream = new PassThrough();
      stream.end();
      await expect(send({}, { stdout: stream })).rejects.toBeInstanceOf(TypeError);
    });
    it('should throw RangeError if >1MB', async () => {
      const stream = new PassThrough();
      await expect(send({
        message: 'A'.repeat(1000000),
      }, { stdout: stream })).rejects.toBeInstanceOf(RangeError);
      stream.end();
    });
  });
  describe('recv()', () => {
    it('should throw TypeError if stdin is not readable', async () => {
      const stream = new PassThrough();
      stream.end();
      stream.destroy();
      stream.read();
      await new Promise((resolve) => stream.on('close', resolve));
      await expect(recv({ stdin: stream })).rejects.toBeInstanceOf(TypeError);
    });
    it('should throw RangeError if >1MB', async () => {
      const stream = new PassThrough();
      await send({
        message: 'A'.repeat(1000),
      }, {
        stdout: stream,
      });
      await expect(recv({
        maxSize: 1000,
        stdin: stream,
      })).rejects.toBeInstanceOf(RangeError);
      stream.end();
    });
  });
  it('should send and receive messages', async () => {
    const message = 'if you can read me it worked';
    const stream = new PassThrough();
    await send({ message }, { stdout: stream });
    const received = await recv<any>({ stdin: stream });
    expect(received.message).toBe(message);
    stream.end();
  });
});
