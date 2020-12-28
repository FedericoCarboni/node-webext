'use strict';

const { PassThrough } = require('stream');
const { send, recv } = require('../lib/lib');

test('send() throws RangeError when >1MB', async () => {
  const mock = new PassThrough();
  expect(send({ message: 'A'.repeat(1000000) }, { stdout: mock })).rejects.toBeInstanceOf(RangeError);
});

test('recv() throws RangeError when >maxSize', async () => {
  const mock = new PassThrough();
  await send({ message: 'A'.repeat(100000) }, { stdout: mock });
  expect(recv({ stdin: mock, maxSize: 100000 })).rejects.toBeInstanceOf(RangeError);
});

test('send and receive messages', async () => {
  const mock = new PassThrough();
  await send({ message: 'A' }, { stdout: mock });
  const message = await recv({ stdin: mock });
  expect(message.message).toBe('A');
});
