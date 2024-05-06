/* eslint-disable no-console */
import { after, afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Fun, Arr, Obj, Type } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.EditorOptionsDebugTest', () => {
  const createHook = (options: Record<string, unknown>) =>
    TinyHooks.bddSetupLight<Editor>({
      ...options,
      base_url: '/project/tinymce/js/tinymce',
    }, []);

  const METHODS = [ 'log', 'error' ] as const;
  const logs = METHODS.reduce(
    (acc, method) => (acc[method] = [], acc),
    {} as Record<typeof METHODS[number], unknown[][]>
  );
  const cleanup: (() => void)[] = [];
  for (const method of METHODS) {
    const original = console[method];
    console[method] = (...args: unknown[]) => {
      original(...args);
      logs[method].push(args);
    };
    cleanup.push(() => {
      console[method] = original;
    });
  }

  const ignoredKeys = new Set([ 'promotion', 'toolbar', 'menubar', 'statusbar', 'base_url', 'selector', 'setup' ]);
  const assertLastLog = (expected: unknown) => {
    const log = Arr.last(logs.log)
      .filter((args): args is [Record<string, unknown>] => Type.isObject(args[0]) && Type.isNonNullable(args[0]))
      .map(([ log ]) => Obj.filter(log, (_, k) => !ignoredKeys.has(k)))
      .getOrDie(`Expected a console.log`);
    assert.deepEqual(log, expected);
  };

  after(() => {
    let fn: (() => void) | undefined;
    while ((fn = cleanup.pop())) {
      fn();
    }
  });
  afterEach(() => METHODS.forEach((method) => (logs[method] = [])));

  // const create = (initialOptions: Record<string, any>): EditorOptions.Options =>
  //   EditorOptions.create(hook.editor(), initialOptions);

  // const logValue = (value: unknown) => {
  //   processed.push(value);
  //   return true;
  // };

  context('With empty options', () => {
    const hook = createHook({});
    it('TINY-10605: should log empty object', () => {
      hook.editor().options.debug();
      assertLastLog({});
    });
  });

  context('With function', () => {
    const hook = createHook({
      file_picker_callback: Fun.noop
    });
    it('TINY-10605: Functions should log "[object Function]"', () => {
      hook.editor().options.debug();
      assertLastLog({ file_picker_callback: '[object Function]' });
    });
  });

  context('With circular reference', () => {
    const a: any = {};
    const b: any = { a };
    a.b = b;
    const hook = createHook({ a, b });
    it('TINY-10605: Circular references should error log a TypeError', () => {
      hook.editor().options.debug();
      const error = Arr.last(logs.error).getOrDie('Expected a console.error')[0];
      assert.instanceOf(error, TypeError);
    });
  });

  context('With valid values', () => {
    const initialOptions = {
      plugins: 'table lists image accordion code',
      directionality: 'rtl',
      height: 500,
      paste_as_text: true,
      context_menu: [ 'image', 'lists' ],
      menu: { insert: { title: 'Insert', items: 'table | image | accordion' }},
    };
    const hook = createHook(initialOptions);
    it('TINY-10605: Leaves objects, arrays and primitive values as is', () => {
      hook.editor().options.debug();
      assertLastLog(initialOptions);
    });
  });
});
