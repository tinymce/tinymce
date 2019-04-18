import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Editor as McEditor, ApiChains } from '@ephox/mcagar';
import { Pipeline, Logger, Chain, Step, UiFinder, Assertions, Guard } from '@ephox/agar';
import { Cell, Fun } from '@ephox/katamari';
import { Element, Body, Insert, Remove, Focus } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('Remove context menu on focusout', (success, failure) => {
  Theme();

  const inputElmCell = Cell<Element>(null);
  const sAddInput = Step.sync(() => {
    const input = Element.fromTag('input');
    inputElmCell.set(input);

    Insert.append(Body.body(), input);
  });

  const sRemoveInput = Step.sync(() => {
    Remove.remove(inputElmCell.get());
  });

  const cFocusInput = Chain.op(() => {
    Focus.focus(inputElmCell.get());
  });

  const cWaitForContextmenuState = (state: boolean) => Chain.control(
    Chain.op(() => {
      const contextToolbar = UiFinder.findIn(Body.body(), '.tox-pop');

      Assertions.assertEq('no context toolbar', state, contextToolbar.isValue());
    }),
    Guard.tryUntil('Wait for context menu to appear.', 100, 3000)
  );

  const html = '<p>One <a href="http://tiny.cloud">link</a> Two</p>';

  const setup = (ed: Editor) => {
    ed.ui.registry.addButton('alpha', {
      text: 'Alpha',
      onAction: Fun.noop
    });
    ed.ui.registry.addContextToolbar('test-toolbar', {
      predicate: (node) => {
        return node.nodeName && node.nodeName.toLowerCase() === 'a'; },
      items: 'alpha'
    });
  };

  Pipeline.async({}, [
    sAddInput,
    Logger.t('iframe editor focusout should remove context menu', Chain.asStep({}, [
      McEditor.cFromHtml(html, { setup, base_url: '/project/tinymce/js/tinymce' }),
      ApiChains.cFocus,
      ApiChains.cSetCursor([ 0, 1, 0 ], 1),
      cWaitForContextmenuState(true),
      cFocusInput,
      cWaitForContextmenuState(false),
      McEditor.cRemove
    ])),
    Logger.t('inline editor focusout should remove context menu', Chain.asStep({}, [
      McEditor.cFromHtml(html, { setup, inline: true, base_url: '/project/tinymce/js/tinymce' }),
      ApiChains.cFocus,
      ApiChains.cSetCursor([ 1, 0 ], 1),
      cWaitForContextmenuState(true),
      cFocusInput,
      cWaitForContextmenuState(false),
      McEditor.cRemove
    ])),
    sRemoveInput
  ], () => success(), failure);
});
