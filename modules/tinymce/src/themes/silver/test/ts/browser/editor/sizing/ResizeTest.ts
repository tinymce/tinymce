import { FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { before, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Css, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

import { resizeEditorBy } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.sizing.ResizeTTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    resize: 'both',
    min_height: 300,
    min_width: 300,
    height: 400,
    width: 400,
    max_height: 500,
    max_width: 500
  }, []);

  const assertEditorSize = (container: SugarElement<HTMLElement>, expectedWidth: number, expectedHeight: number) => {
    assert.equal(container.dom.offsetHeight, expectedHeight, `Editor should be ${expectedHeight}px high`);
    assert.equal(container.dom.offsetWidth, expectedWidth, `Editor should be ${expectedWidth}px wide`);
  };

  before(() => {
    const editor = hook.editor();
    // Add a border to ensure we're using the correct height/width (ie border-box sizing)
    editor.dom.setStyles(editor.getContainer(), {
      border: '2px solid #ccc'
    });
  });

  // Make sure the height is reset
  beforeEach(() => {
    const editor = hook.editor();
    const container = TinyDom.container(editor);
    Css.setAll(container, {
      width: editor.options.get('width') + 'px',
      height: editor.options.get('height') + 'px',
    });
  });

  it('Test resize with max/min sizing', async () => {
    const editor = hook.editor();
    const container = TinyDom.container(editor);

    // Shrink to 300px
    await resizeEditorBy([ -100, -100 ]);
    assertEditorSize(container, 300, 300);

    // Enlarge to 450px
    await resizeEditorBy([ 150, 150 ]);
    assertEditorSize(container, 450, 450);

    // Try to shrink to below min height
    await resizeEditorBy([ 0, -200 ]);
    assertEditorSize(container, 450, 300);

    // Try to enlarge to above max height
    await resizeEditorBy([ 0, 250 ]);
    assertEditorSize(container, 450, 500);

    // Try to shrink to below min width
    await resizeEditorBy([ -200, 0 ]);
    assertEditorSize(container, 300, 500);

    // Try to enlarge to above max width
    await resizeEditorBy([ 250, 0 ]);
    assertEditorSize(container, 500, 500);
  });

  it('TINY-4823: can be resized via the keyboard', () => {
    const editor = hook.editor();
    const container = TinyDom.container(editor);

    FocusTools.setFocus(SugarBody.body(), '.tox-statusbar__resize-handle');

    // Make it larger
    for (let i = 0; i < 3; ++i) {
      TinyUiActions.keystroke(editor, Keys.right());
    }
    assertEditorSize(container, 460, 400);

    for (let i = 0; i < 3; ++i) {
      TinyUiActions.keystroke(editor, Keys.down());
    }
    assertEditorSize(container, 460, 460);

    // Make it smaller again
    for (let i = 0; i < 3; ++i) {
      TinyUiActions.keystroke(editor, Keys.left());
    }
    assertEditorSize(container, 400, 460);

    for (let i = 0; i < 3; ++i) {
      TinyUiActions.keystroke(editor, Keys.up());
    }
    assertEditorSize(container, 400, 400);
  });

  it('TINY-11421: Aria-valuetext should update on resize', async () => {
    const editor = hook.editor();
    const container = editor.getContainer();
    await UiFinder.pWaitForVisible('Wait for resize handle to be visible', SugarBody.body(), '.tox-statusbar__resize-handle');
    const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();

    await Waiter.pTryUntil('Editor should initialize with the width and height from the config', () => {
      assertEditorSize(SugarElement.fromDom(container), 400, 400);
      assert.equal(
        resizeHandle.dom.getAttribute('aria-valuetext'),
        `Editor's height: ${container.offsetHeight} pixels, Editor's width: ${container.offsetWidth} pixels`,
        'aria-valuetext should have original editors dimentions before resize'
      );
    });

    await resizeEditorBy([ -100, -100 ]);

    assertEditorSize(SugarElement.fromDom(container), 300, 300);
    assert.equal(
      resizeHandle.dom.getAttribute('aria-valuetext'),
      `Editor's height: 300 pixels, Editor's width: 300 pixels`,
      'aria-valuetext should have updated editors dimentions after resize'
    );
  });
});
