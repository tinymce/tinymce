import { Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { window } from '@ephox/dom-globals';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Body, Css, Element, Insert, Location, Scroll } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { sAssertFloatingToolbarHeight, sOpenFloatingToolbarAndAssertPosition } from '../../../module/ToolbarUtils';

UnitTest.asynctest('Editor Floating Toolbar Drawer Position test', (success, failure) => {
  Theme();
  const toolbarHeight = 39;
  const toolbarDrawerHeight = 80;
  const windowBottomOffset = window.innerHeight - 100;

  const sScrollTo = (x: number, y: number) => Step.sync(() => Scroll.to(x, y));

  // Setup the element to render to
  const rootElement = Element.fromTag('div');
  const editorElement = Element.fromTag('textarea');
  Css.set(rootElement, 'margin-left', '100px');
  Insert.append(rootElement, editorElement);
  Insert.append(Body.body(), rootElement);

  TinyLoader.setupFromElement((editor: Editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const uiContainer = Element.fromDom(editor.getContainer());
    const initialContainerPos = Location.absolute(uiContainer);

    const sAddMargins = Step.sync(() => {
      Css.set(uiContainer, 'margin-top', '2000px');
      Css.set(uiContainer, 'margin-bottom', '2000px');
    });

    const sRemoveMargins = Step.sync(() => {
      Css.remove(uiContainer, 'margin-top');
      Css.remove(uiContainer, 'margin-bottom');
    });

    Pipeline.async({ }, [
      // Firefox requires a small wait, otherwise the initial toolbar position is incorrect
      ...PlatformDetection.detect().browser.isFirefox() ? [ Step.wait(100) ] : [ ],
      Log.stepsAsStep('TBA', 'Editor in the page', [
        // Top of screen
        sOpenFloatingToolbarAndAssertPosition(tinyUi, () => initialContainerPos.top() + toolbarHeight, [ // top of ui container + toolbar height
          sAssertFloatingToolbarHeight(tinyUi, toolbarDrawerHeight)
        ]),
        sAddMargins,
        // Top of screen + scrolled
        sScrollTo(0, initialContainerPos.top() + 2000),
        sOpenFloatingToolbarAndAssertPosition(tinyUi, () => initialContainerPos.top() + toolbarHeight + 2000, [ // top of ui container + toolbar height + scroll pos
          sAssertFloatingToolbarHeight(tinyUi, toolbarDrawerHeight)
        ]),
        // Bottom of screen + scrolled
        sScrollTo(0, initialContainerPos.top() + 2000 - windowBottomOffset),
        sOpenFloatingToolbarAndAssertPosition(tinyUi, () => initialContainerPos.top() + toolbarHeight + 2000, [ // top of ui container + toolbar height + scroll pos
          sAssertFloatingToolbarHeight(tinyUi, toolbarDrawerHeight)
        ]),
        sRemoveMargins
      ]),
      Log.stepsAsStep('TINY-4837', 'Editor in floating element (eg dialog)', [
        Step.sync(() => {
          Css.set(rootElement, 'position', 'absolute');
        }),
        sScrollTo(0, 0),
        // Top of screen
        sOpenFloatingToolbarAndAssertPosition(tinyUi, () => initialContainerPos.top() + toolbarHeight, [ // top of ui container + toolbar height
          sAssertFloatingToolbarHeight(tinyUi, toolbarDrawerHeight)
        ]),
        sAddMargins,
        // Top of screen + scrolled
        sScrollTo(0, initialContainerPos.top() + 2000),
        sOpenFloatingToolbarAndAssertPosition(tinyUi, () => initialContainerPos.top() + toolbarHeight + 2000, [ // top of ui container + toolbar height + scroll pos
          sAssertFloatingToolbarHeight(tinyUi, toolbarDrawerHeight)
        ]),
        // Bottom of screen + scrolled
        sScrollTo(0, initialContainerPos.top() + 2000 - windowBottomOffset),
        sOpenFloatingToolbarAndAssertPosition(tinyUi, () => initialContainerPos.top() + toolbarHeight + 2000, [ // top of ui container + toolbar height + scroll pos
          sAssertFloatingToolbarHeight(tinyUi, toolbarDrawerHeight)
        ]),
        sRemoveMargins
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    menubar: false,
    width: 400,
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'undo redo | styleselect | bold italic underline | strikethrough superscript subscript | alignleft aligncenter alignright aligncenter | outdent indent | cut copy paste | selectall remove',
    toolbar_mode: 'floating'
  }, editorElement, success, failure);
});
