import { context, describe, it } from '@ephox/bedrock-client';
import { Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.SplitButtonPopupPositionWithFullscreenTest', () => {
  context('in scrollable container', () => {
    let rootElement: SugarElement<HTMLDivElement>;
    const setupElement = () => {
      // Setup the element to render to
      rootElement = SugarElement.fromTag('div');
      const editorElement = SugarElement.fromTag('textarea');
      Css.set(rootElement, 'position', 'absolute');
      Css.set(rootElement, 'width', '500px');
      Css.set(rootElement, 'top', '25%');
      Css.set(rootElement, 'left', '25%');
      Css.set(rootElement, 'height', '300px');
      Css.set(rootElement, 'overflow', 'scroll');
      Insert.append(rootElement, editorElement);
      Insert.append(SugarBody.body(), rootElement);
      return {
        element: editorElement,
        teardown: () => Remove.remove(rootElement)
      };
    };

    const hook = TinyHooks.bddSetupFromElement<Editor>({
      min_height: 500,
      base_url: '/project/tinymce/js/tinymce',
      plugins: [
        'advlist', 'lists', 'fullscreen'
      ],
      toolbar: 'fullscreen bullist numlist',
      toolbar_mode: 'sliding',
      ui_mode: 'split',
    }, setupElement, []);

    it('TINY-10973: the split button popups should be rendered close to the split button', async () => {
      const editor = hook.editor();
      editor.execCommand('mceFullScreen');
      const button = await TinyUiActions.pWaitForUi(editor, '[aria-label^="Numbered list"]');
      TinyUiActions.clickOnToolbar(editor, '[aria-label^="Numbered list"] > .tox-tbtn + .tox-split-button__chevron');
      const popup = await TinyUiActions.pWaitForUi(editor, '.tox-collection');

      const buttonRect = button.dom.getBoundingClientRect();
      const buttonBottomPosition = buttonRect.bottom;
      const buttonLeftPosition = buttonRect.left;

      const popupRect = popup.dom.getBoundingClientRect();
      const popupTopPosition = popupRect.top;
      const popupLeftPosition = popupRect.left;

      assert.isAtMost(Math.abs(buttonBottomPosition - popupTopPosition), 5, 'popup top position and button bottom position should be close');
      assert.isAtMost(Math.abs(buttonLeftPosition - popupLeftPosition), 5, 'popup left position and button left position should be close');
    });
  });
});
