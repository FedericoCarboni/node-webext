// import crypto from 'crypto';
import fs from 'fs';
import { recv, send } from '../src/io';

describe('send()', () => {
  it('should send a message', async () => {
    const stdout = fs.createWriteStream('stdout');
    const str = Buffer.alloc(10000, 0);
    await send({ A: str.toString('base64'), B: str.toString('base64') }, { stdout });
    stdout.close();
  });
});
describe('recv()', () => {
  it('should recv a message', async () => {
    const stdin = fs.createReadStream('stdout');
    await recv({ stdin });
    // console.log(message.length);
    stdin.close();
  });
});
