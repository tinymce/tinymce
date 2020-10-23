import { Assertions, Chain, Guard, Logger, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell, Fun } from '@ephox/katamari';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import { Focus, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Remove context menu on focusout', (success, failure) => {
  Theme();

  const inputElmCell = Cell<SugarElement>(null);
  const sAddInput = Step.sync(() => {
    const input = SugarElement.fromTag('input');
    inputElmCell.set(input);

    Insert.append(SugarBody.body(), input);
  });

  const sRemoveInput = Step.sync(() => {
    Remove.remove(inputElmCell.get());
  });

  const cFocusInput = Chain.op(() => {
    Focus.focus(inputElmCell.get());
  });

  const cWaitForContextmenuState = (state: boolean) => Chain.control(
    Chain.op(() => {
      const contextToolbar = UiFinder.findIn(SugarBody.body(), '.tox-pop');

      Assertions.assertEq('no context toolbar', state, contextToolbar.isValue());
    }),
    Guard.tryUntil('Wait for context menu to appear.')
  );

  const html = '<p>One <a href="http://tiny.cloud">link</a> Two</p>';

  const setup = (ed: Editor) => {
    ed.ui.registry.addButton('alpha', {
      text: 'Alpha',
      onAction: Fun.noop
    });
    ed.ui.registry.addContextToolbar('test-toolbar', {
      predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'a',
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
