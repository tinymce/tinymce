import { setTimeout } from '@ephox/dom-globals';

import { DieFn } from './Pipe';

const delay = (amount: number) =>
  (next: () => void, _die: DieFn): void => {
    setTimeout(() => {
      next();
    }, amount);
  };

// Not really async, but can fail.
const fail = (message: string) =>
  (next: () => void, die: (err) => void): void => {
    die('Fake failure: ' + message);
  };

export {
  delay,
  fail
};
