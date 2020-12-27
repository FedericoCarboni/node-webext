// @ts-ignore
import { send, recv } from './index';

(async () => {
  while (true) {
    // A simple echo native messaging app
    await send(await recv());
  }
})();
