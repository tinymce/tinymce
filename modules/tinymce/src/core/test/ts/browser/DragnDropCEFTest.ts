import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarLocation } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.DragnDropCEFTest', () => {
  const getBaseCEFElement = (name: string) =>
    `<div class="${name}" style="margin: 40px; width: 1110px; height: 120px;" contenteditable="false">${name}</div>`;

  const getContentWithCefElements = (elementsNames: string[]): string => {
    if (!Arr.contains(elementsNames, 'toDrag') || !Arr.contains(elementsNames, 'destination')) {
      // eslint-disable-next-line no-throw-literal
      throw new Error('This function require to have an element named toDrag and one destination');
    }
    return `<div>${Arr.foldl(elementsNames, (acc, elementName) =>
      acc + getBaseCEFElement(elementName)
    , '')}</div>`;
  };

  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce',
    height: 3000
  }, [], true);

  const moveToDragElementToDestinationElement = async (editor: Editor, xOffset: number, yOffset: number) => {
    const toDrag = UiFinder.findIn(TinyDom.body(editor), '.toDrag').getOrDie();
    const toDragPosition = SugarLocation.viewport(toDrag);

    const dest = UiFinder.findIn(TinyDom.body(editor), '.destination').getOrDie();
    const destPosition = SugarLocation.viewport(dest);
    const yDelta = destPosition.top - toDragPosition.top;
    const xDelta = destPosition.left - toDragPosition.left;

    Mouse.mouseDown(toDrag);
    Mouse.mouseMoveTo(toDrag, xDelta + xOffset, yDelta + yOffset);

    // little trick that give "time" to CaretRange.fromPoint to find the position
    await Waiter.pWait(0);
    Mouse.mouseUp(toDrag);
  };

  it('TINY-8881: Dropping CEF element inside editor fires dragend event', async () => {
    const editor = hook.editor();
    editor.setContent(getContentWithCefElements([ 'obstacle', 'destination', 'toDrag' ]));
    await moveToDragElementToDestinationElement(editor, -5, -5);

    TinyAssertions.assertContent(editor, getContentWithCefElements([ 'obstacle', 'toDrag', 'destination' ]));
  });

  it('TINY-8881: Dragging CEF element over the first element should work as expected', async () => {
    const editor = hook.editor();
    editor.setContent(getContentWithCefElements([ 'destination', 'obstacle', 'toDrag' ]));
    await moveToDragElementToDestinationElement(editor, 10, -15);

    TinyAssertions.assertContent(editor, getContentWithCefElements([ 'toDrag', 'destination', 'obstacle' ]));
  });
});
