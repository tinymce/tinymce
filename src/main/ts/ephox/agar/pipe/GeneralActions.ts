import { console } from '@ephox/dom-globals';

const log = function (message: string) {
  return function () {
    console.log(message);
  };
};

const debug = function () {
  debugger;
};

const pass = function () { };

export {
  log,
  debug,
  pass
};