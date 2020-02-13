import { assert, UnitTest } from '@ephox/bedrock-client';
import { PointerEvent } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';
import { isTriggeredByKeyboard } from 'tinymce/themes/silver/ui/menus/contextmenu/SilverContextMenu';

UnitTest.test('SilverContextMenu - isTriggeredByKeyboard', () => {
  const body = 'body';
  const node = 'node';

  const fakeEditor = {
    getBody: () => body
  } as unknown as Editor;

  const createFakeEvent = (type: string, button: number, target: any, pointerType?: string) => {
    return {
      type,
      pointerType,
      target,
      button
    } as PointerEvent;
  };

  assert.eq(false, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, node))); // Chrome mouse
  assert.eq(false, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, body))); // Chrome mouse
  assert.eq(true, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 0, node))); // Chrome keyboard

  assert.eq(false, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, node))); // Firefox mouse
  assert.eq(false, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, body))); // Firefox mouse
  assert.eq(true, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 0, body))); // Firefox keyboard

  assert.eq(false, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, node, 'mouse'))); // Edge mouse
  assert.eq(false, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, body, 'mouse'))); // Edge mouse
  assert.eq(true, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, body, ''))); // Edge keyboard

  assert.eq(false, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, node, 'mouse'))); // IE mouse
  assert.eq(false, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, body, 'mouse'))); // IE mouse
  assert.eq(true, isTriggeredByKeyboard(fakeEditor, createFakeEvent('contextmenu', 2, body, ''))); // IE keyboard
});
