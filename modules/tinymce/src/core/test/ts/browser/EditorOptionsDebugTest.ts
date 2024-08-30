/* eslint-disable no-console */
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun, Arr, Obj, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.EditorOptionsDebugTest', () => {
  const createHook = (options: Record<string, unknown>) =>
    TinyHooks.bddSetupLight<Editor>({
      ...options,
      base_url: '/project/tinymce/js/tinymce',
    }, []);
  const ignoredKeys = new Set([ 'license_key', 'promotion', 'toolbar', 'menubar', 'statusbar', 'base_url', 'selector', 'setup' ]);
  const assertDebugLog = (editor: Editor, expectedLog: unknown) => {
    const logs: unknown[] = [];
    const originalLog = console.log;
    console.log = (arg: unknown) => logs.push(arg);
    editor.options.debug();
    console.log = originalLog;

    const log = Arr.last(logs)
      .filter((args): args is Record<string, unknown> => Type.isObject(args) && Type.isNonNullable(args))
      .map((log) => Obj.filter(log, (_, k) => !ignoredKeys.has(k)))
      .getOrDie(`Expected a console.log`);
    assert.deepEqual(log, expectedLog);
  };

  context('With empty options', () => {
    const hook = createHook({});
    it('TINY-10605: should log empty object', () => {
      assertDebugLog(hook.editor(), {});
    });
  });

  context('With function', () => {
    const hook = createHook({
      file_picker_callback: Fun.noop
    });
    it('TINY-10605: Functions should log "[object Function]"', () => {
      assertDebugLog(hook.editor(), { file_picker_callback: '[object Function]' });
    });
  });

  context('With undefined', () => {
    const hook = createHook({
      encoding: undefined
    });
    it('TINY-10605: Undefined values should log "[object Undefined]"', () => {
      assertDebugLog(hook.editor(), { encoding: '[object Undefined]' });
    });
  });

  context('With RegExp', () => {
    const hook = createHook({
      protect: /a/
    });
    it('TINY-10605: RegExp values should log "[object RegExp]"', () => {
      assertDebugLog(hook.editor(), { protect: '[object RegExp]' });
    });
  });

  context('With div node', () => {
    const hook = createHook({
      fixed_toolbar_container_target: SugarElement.fromTag('div').dom
    });
    it('TINY-10605: Divs should log "[object HTMLDivElement]"', () => {
      assertDebugLog(hook.editor(), { fixed_toolbar_container_target: '[object HTMLDivElement]' });
    });
  });

  context('With circular reference', () => {
    const a: any = {};
    const b: any = { a };
    a.b = b;
    const hook = createHook({ a, b });
    it('TINY-10605: Circular references should error log a TypeError', () => {
      const logs: unknown[] = [];
      const originalError = console.error;
      console.error = (arg: unknown) => logs.push(arg);
      hook.editor().options.debug();
      console.error = originalError;

      const error = Arr.last(logs).getOrDie('Expected a console.error');
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
      inline: null
    };
    const hook = createHook(initialOptions);
    it('TINY-10605: Leaves objects, arrays, null, strings, number and booleans as is', () => {
      assertDebugLog(hook.editor(), initialOptions);
    });
  });
});
