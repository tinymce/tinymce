import { setTimeout } from '@ephox/dom-globals';

export const bounce = function (f: Function) {
  return function(...args: any[]) {
    const me = this;
    setTimeout(function() {
      f.apply(me, args);
    }, 0);
  };
};