import { Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarLocation } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.DragnDropCEFTest', () => {
  const getBaseCEFElement = (name: string) =>
    `<div class="${name}" style="margin: 40px; width: 1110px; height: 120px;" contenteditable="false">${name}</div>`;

  const getContentWithCefElements = (elementsNames: string[]): string => `<div>${Arr.foldl(elementsNames, (acc, elementName) =>
    acc + getBaseCEFElement(elementName)
  , '')}</div>`;

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce',
    height: 3000
  }, [], true);

  it('TINY-8881: Dropping CEF element inside editor fires dragend event', async () => {
    const editor = hook.editor();
    editor.setContent(getContentWithCefElements([ 'obstacle', 'destination', 'toDrag' ]));
    const toDrag = UiFinder.findIn(TinyDom.body(editor), '.toDrag').getOrDie();
    const toDragPosition = SugarLocation.viewport(toDrag);

    const dest = UiFinder.findIn(TinyDom.body(editor), '.destination').getOrDie();
    const destPosition = SugarLocation.viewport(dest);
    const yDelta = destPosition.top - toDragPosition.top;
    const xDelta = destPosition.left - toDragPosition.left;

    Mouse.mouseDown(toDrag);
    Mouse.mouseMoveTo(toDrag, xDelta - 5, yDelta - 5);

    // little trick that give "time" to CaretRange.fromPoint to find the position
    await wait(0);
    Mouse.mouseUp(toDrag);

    TinyAssertions.assertContent(editor, getContentWithCefElements([ 'obstacle', 'toDrag', 'destination' ]));
  });

  it('TINY-8881: Dragging CEF element over the first element should work as expected', async () => {
    const editor = hook.editor();
    editor.setContent(getContentWithCefElements([ 'obstacle', 'destination', 'toDrag' ]));

    const toDrag = UiFinder.findIn(TinyDom.body(editor), '.toDrag').getOrDie();
    const toDragPosition = SugarLocation.viewport(toDrag);

    const obst = UiFinder.findIn(TinyDom.body(editor), '.obstacle').getOrDie();
    const obstPosition = SugarLocation.viewport(obst);
    const yDelta = obstPosition.top - toDragPosition.top;
    const xDelta = obstPosition.left - toDragPosition.left;

    Mouse.mouseDown(toDrag);
    Mouse.mouseMoveTo(toDrag, xDelta + 10, yDelta - 15);
    // little trick that give "time" to CaretRange.fromPoint to find the position
    await wait(0);

    Mouse.mouseUp(toDrag);

    TinyAssertions.assertContent(editor, getContentWithCefElements([ 'toDrag', 'obstacle', 'destination' ]));
  });
});
