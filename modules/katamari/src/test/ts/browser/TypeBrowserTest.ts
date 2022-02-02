import { describe, it } from '@ephox/bedrock-client';
import Promise from '@ephox/wrap-promise-polyfill';

import * as Type from 'ephox/katamari/api/Type';

describe('browser.katamari.TypeBrowserTest', () => {
  it('Type cross window test', () => new Promise<void>((success, failure) => {

    const runTest = (frameEval: (script: string) => any) => {
      const check = (expected, method, input) => {
        const frameValue = frameEval(input);
        if (expected !== Type[method](frameValue)) {
          const failMessage = `Type method ${method} did not return ${expected} for frame value '${input}'`;
          failure(failMessage);
          throw new Error(failMessage);
        }
      };

      // just a subset of what's in the full TypeTest for now
      check(true, 'isArray', '[]');
      check(false, 'isObject', '[]');
      check(false, 'isString', '[]');
      check(false, 'isFunction', '[]');
      check(false, 'isNumber', '[]');

      check(false, 'isArray', '({})');
      check(true, 'isObject', '({})');
      check(false, 'isString', '({})');
      check(false, 'isFunction', '({})');
      check(false, 'isNumber', '({})');

      check(false, 'isArray', '"hi"');
      check(false, 'isObject', '"hi"');
      check(true, 'isString', '"hi"');
      check(false, 'isFunction', '"hi"');
      check(false, 'isNumber', '"hi"');

      check(false, 'isArray', 'new Function()');
      check(false, 'isObject', 'new Function()');
      check(false, 'isString', 'new Function()');
      check(true, 'isFunction', 'new Function()');
      check(false, 'isNumber', 'new Function()');

      check(false, 'isArray', '5');
      check(false, 'isObject', '5');
      check(false, 'isString', '5');
      check(false, 'isFunction', '5');
      check(true, 'isNumber', '5');
    };

    // no sugar, because sugar depends on katamari
    const iframe = document.createElement('iframe');

    iframe.addEventListener('load', () => {
      // tslint:disable-next-line: no-string-literal
      const frameEval = (script: string): any => {
        const cw: Window | null = iframe.contentWindow;
        if (cw == null) {
          throw new Error('contentWindow was null');
        }
        // TypeScript doesn't think that Window.eval exists
        return (cw as any).eval(script);
      };

      try {
        runTest(frameEval);
        success();
      } finally {
        iframe.remove();
      }
    });
    document.body.appendChild(iframe);
  }));
});
