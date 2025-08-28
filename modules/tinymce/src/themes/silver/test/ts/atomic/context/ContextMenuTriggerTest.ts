import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { isTriggeredByKeyboard } from 'tinymce/themes/silver/ui/menus/contextmenu/SilverContextMenu';

describe('atomic.tinymce.themes.silver.context.ContextMenuTriggerTest', () => {
  context('isTriggeredByKeyboard', () => {
    const body = 'body';
    const node = 'node';

    const fakeEditor = {
      getBody: Fun.constant(body)
    } as unknown as Editor;

    const createFakeEvent = (type: string, button: number, target: any, pointerType?: string) => ({
      type,
      pointerType,
      target,
      button
    } as PointerEvent);

    it('Check chrome-like event', () => {
      assert.isFalse(isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, node))); // Chrome mouse
      assert.isFalse(isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, body))); // Chrome mouse
      assert.isTrue(isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 0, node))); // Chrome keyboard
    });

    it('Check firefox-like event', () => {
      assert.isFalse(isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, node))); // Firefox mouse
      assert.isFalse(isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, body))); // Firefox mouse
      assert.isTrue(isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 0, body))); // Firefox keyboard
    });
  });
});
