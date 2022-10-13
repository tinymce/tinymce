import { Keys, UiFinder, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Css, Scroll, SugarBody } from '@ephox/sugar';
import { TinyContentActions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';

import { getGreenImageDataUrl } from '../../../module/Assets';

interface Scenario {
  readonly content: string;
  readonly contentStyles?: string;
  readonly cursor: {
    readonly elementPath: number[];
    readonly offset: number;
  };
  readonly classes: string;
}

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarIFramePosition test', () => {
  const topSelector = '.tox-pop.tox-pop--bottom:not(.tox-pop--inset):not(.tox-pop--transition)';
  const bottomSelector = '.tox-pop.tox-pop--top:not(.tox-pop--inset):not(.tox-pop--transition)';
  const rightSelector = '.tox-pop.tox-pop--left:not(.tox-pop--inset):not(.tox-pop--transition)';
  const topInsetSelector = '.tox-pop.tox-pop--top.tox-pop--inset:not(.tox-pop--transition)';
  const bottomInsetSelector = '.tox-pop.tox-pop--bottom.tox-pop--inset:not(.tox-pop--transition)';

  const fullscreenSelector = '.tox.tox-fullscreen';
  const fullscreenButtonSelector = 'button[aria-label="Fullscreen"]';

  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'fullscreen',
    toolbar: 'fullscreen',
    height: 400,
    base_url: '/project/tinymce/js/tinymce',
    // Note: We provide overrides to keep consistent positions across all browsers/os's
    content_style: 'body, p { margin: 0; line-height: 22px; font-family: Arial,sans-serif; } tr { height: 36px; }',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('alpha', {
        text: 'Alpha',
        onAction: Fun.noop
      });
      ed.ui.registry.addContextToolbar('test-selection-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'a',
        items: 'alpha'
      });
      ed.ui.registry.addContextToolbar('test-selection-toolbar-2', {
        predicate: (node) => node.nodeName.toLowerCase() === 'p' && !ed.selection.isCollapsed(),
        items: 'alpha',
        position: 'selection'
      });
      ed.ui.registry.addContextToolbar('test-node-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'img',
        items: 'alpha',
        position: 'node'
      });
      ed.ui.registry.addContextToolbar('test-line-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'div',
        items: 'alpha',
        position: 'line'
      });
      ed.ui.registry.addContextToolbar('test-table-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'table',
        items: 'alpha',
        position: 'node'
      });
    }
  }, [ FullscreenPlugin ], true);

  beforeEach(() => {
    // Reset scroll position for each test
    scrollTo(hook.editor(), 0, 0);
  });

  const scrollTo = (editor: Editor, x: number, y: number) =>
    Scroll.to(x, y, TinyDom.document(editor));

  const pAssertPosition = (position: string, value: number, diff = 5) => Waiter.pTryUntil('Wait for toolbar to be positioned', () => {
    const ele = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    const styles = parseInt(Css.getRaw(ele, position).getOr('0').replace('px', ''), 10);
    assert.approximately(styles, value, diff, `Assert toolbar position - ${position} ${styles}px ~= ${value}px`);
  });

  const pAssertFullscreenPosition = (position: 'top' | 'bottom', value: number, diff = 5) => Waiter.pTryUntil('Wait for toolbar to be positioned', () => {
    const ele = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    // The context toolbar is positioned relative to the sink, so the value can change between browsers due to different default styles
    // as such we can't reliably test using the actual top/bottom position, so use the bounding client rect instead.
    const pos = ele.dom.getBoundingClientRect();
    assert.approximately(pos[position], value, diff, `Assert toolbar position - ${position} ${pos[position]}px ~= ${value}px`);
  });

  const pWaitForToolbarHidden = () => UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');

  const pAssertHasNotFlipped = async (selector: string) => {
    await Waiter.pWait(50); // Need to wait a fixed amount as nothing will change
    await UiFinder.pWaitForVisible('Ensure the context toolbar has not flipped', SugarBody.body(), selector);
  };

  const pAssertToolbarIsTransitioning = () => Waiter.pTryUntil('Wait for toolbar to include the transition class', () => {
    UiFinder.exists(SugarBody.body(), '.tox-pop.tox-pop--transition');
  });

  const assertToolbarIsNotTransitioning = () => {
    UiFinder.notExists(SugarBody.body(), '.tox-pop.tox-pop--transition');
  };

  const pTestPositionWhileScrolling = (scenario: Scenario) => async () => {
    const editor = hook.editor();
    editor.setContent(
      '<p style="height: 100px"></p>' +
      '<p style="height: 100px"></p>' +
      '<p style="height: 100px"></p>' +
      `<p style="height: 25px;${scenario.contentStyles || ''}">${scenario.content}</p>` +
      '<p style="height: 100px"></p>' +
      '<p style="height: 100px"></p>' +
      '<p style="height: 100px"></p>'
    );
    editor.focus();
    scrollTo(editor, 0, 200);
    TinySelections.setCursor(editor, scenario.cursor.elementPath, scenario.cursor.offset);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), topSelector + scenario.classes);
    await pAssertPosition('bottom', 223);

    // Position the link at the top of the viewport, just below the toolbar
    scrollTo(editor, 0, 300);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), bottomSelector + scenario.classes);
    await pAssertPosition('top', -277);

    // Position the behind the menu/toolbar and check the context toolbar is hidden
    scrollTo(editor, 0, 400);
    await pWaitForToolbarHidden();

    // Position the element back into view
    scrollTo(editor, 0, 200);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), topSelector + scenario.classes);
    await pAssertPosition('bottom', 223);

    // Position the element off the top of the screen and check the context toolbar is hidden
    scrollTo(editor, 0, 600);
    await pWaitForToolbarHidden();
  };

  context('Context toolbar selection position while scrolling', () => {
    // north/south
    it('north to south to hidden', pTestPositionWhileScrolling({
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      cursor: {
        elementPath: [ 3, 1, 0 ],
        offset: 1
      },
      classes: ''
    }));

    // northeast/southeast
    it('northeast to southeast to hidden', pTestPositionWhileScrolling({
      content: '<a href="http://tiny.cloud">link</a> Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      cursor: {
        elementPath: [ 3, 0, 0 ],
        offset: 1
      },
      classes: '.tox-pop--align-left'
    }));

    // northeast/southeast
    it('northwest to southwest to hidden', pTestPositionWhileScrolling({
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      contentStyles: 'text-align: right',
      cursor: {
        elementPath: [ 3, 1, 0 ],
        offset: 4
      },
      classes: '.tox-pop--align-right'
    }));
  });

  it('TBA: Context toolbar falls back to positioning inside the content', async () => {
    const editor = hook.editor();
    editor.setContent(`<p><img src="${getGreenImageDataUrl()}" style="height: 380px; width: 100px"></p>`);
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear to top inside content', SugarBody.body(), topInsetSelector);
    await pAssertPosition('top', -312);
    TinySelections.setCursor(editor, [ 0 ], 1);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyContentActions.keystroke(editor, Keys.enter());
    editor.nodeChanged();
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), bottomSelector);
    await pAssertPosition('top', -86);
  });

  it(`TINY-4586: Line context toolbar remains inside iframe container and doesn't overlap the header`, async () => {
    const editor = hook.editor();
    editor.setContent(
      '<p style="height: 400px"></p>' +
      '<div style="height: 25px;"></div>' +
      '<p style="height: 400px"></p>'
    );
    scrollTo(editor, 0, 225);
    TinySelections.setCursor(editor, [ 1, 0 ], 0);

    // Middle
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear', SugarBody.body(), rightSelector);
    await pAssertPosition('top', -145);

    // Scroll so div is below the status bar
    scrollTo(editor, 0, 50);
    await pWaitForToolbarHidden();

    // Bottom
    scrollTo(editor, 0, 105);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear', SugarBody.body(), rightSelector);
    await pAssertPosition('top', -44);

    // Scroll so div is behind header
    scrollTo(editor, 0, 450);
    await pWaitForToolbarHidden();

    // Top
    scrollTo(editor, 0, 400);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear', SugarBody.body(), rightSelector);
    await pAssertPosition('top', -314);
  });

  it('TINY-4023: Context toolbar is visible in fullscreen mode', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, fullscreenButtonSelector);
    TinyUiActions.pWaitForUi(editor, fullscreenSelector);
    editor.setContent(`<p><img src="${getGreenImageDataUrl()}" style="height: 380px; width: 100px"></p>`);
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear to below the content', SugarBody.body(), bottomSelector);
    await pAssertFullscreenPosition('top', 478);
    await UiFinder.pWaitForVisible('Check toolbar is still visible', SugarBody.body(), bottomSelector);
    TinyUiActions.clickOnToolbar(editor, fullscreenButtonSelector);
    await Waiter.pTryUntil('Wait for fullscreen to turn off', () => UiFinder.notExists(SugarBody.body(), fullscreenSelector));
  });

  it('TBA: Context toolbar should hide when scrolled out of view', async () => {
    const editor = hook.editor();
    Css.set(TinyDom.container(editor), 'margin-bottom', '5000px');
    editor.setContent('<p><a href="http://tiny.cloud">link</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), bottomSelector);
    await Waiter.pWait(250); // TODO: Find out why Safari fails without this wait
    window.scrollTo(0, 2000);
    await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');
    Css.remove(TinyDom.container(editor), 'margin-bottom');
  });

  it('TINY-7739: Selection context toolbar should not escape the bounds or use an inset layout', async () => {
    const editor = hook.editor();
    editor.setContent('<p style="padding-top: 100px;"></p><p style="padding-top: 100px;"></p><p style="padding-top: 100px;"></p>text</p>');
    TinySelections.setSelection(editor, [ 3, 0 ], 1, [ 3, 0 ], 3);
    // Place the selected text right at the bottom of the editor so only ~1px of the selection is visible
    scrollTo(editor, 0, 86);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear above the content', SugarBody.body(), topSelector);
    // Moving 2px more the selected text is now offscreen so the context toolbar should hide
    scrollTo(editor, 0, 84);
    await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');
  });

  it('TINY-7545: Context toolbar preserves the previous position when scrolling top to bottom and back', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<p style="padding-top: 200px"></p>' +
      `<p><img src="${getGreenImageDataUrl()}" style="height: 500px; width: 100px"></p>` +
      '<p style="padding-top: 200px"></p>'
    );
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the top outside content', SugarBody.body(), topSelector);
    await pAssertPosition('bottom', 104);

    scrollTo(editor, 0, 400);
    assertToolbarIsNotTransitioning();
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the top inside content', SugarBody.body(), topInsetSelector);
    await pAssertPosition('top', -312);

    scrollTo(editor, 0, 700);
    await pAssertToolbarIsTransitioning();
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the bottom outside content', SugarBody.body(), bottomSelector);
    await pAssertPosition('top', -242);

    scrollTo(editor, 0, 400);
    assertToolbarIsNotTransitioning();
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the bottom inside content', SugarBody.body(), bottomInsetSelector);
    await pAssertPosition('bottom', 34);

    scrollTo(editor, 0, 0);
    await pAssertToolbarIsTransitioning();
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the bottom inside content', SugarBody.body(), topSelector);
    await pAssertPosition('bottom', 104);
  });

  it('TINY-7545: Moving from different anchor points should reset the placement', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<p style="padding-top: 200px"></p>' +
      '<div style="height: 25px;"></div>' +
      `<p><img src="${getGreenImageDataUrl()}" style="height: 500px; width: 100px"></p>` +
      '<p style="padding-top: 200px"></p>'
    );

    // Select the div and make sure the toolbar shows to the right
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear', SugarBody.body(), rightSelector);

    // Scroll to and select the image, then make sure the toolbar appears at the top
    scrollTo(editor, 0, 400);
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the top inside content', SugarBody.body(), topInsetSelector);
  });

  it('TINY-7192: Toolbar should flip to the opposite position when the selection overlaps', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="width: 100%; border-collapse: collapse;">' +
      '<tbody>' +
      Arr.range(10, (i) => `<tr><td>Cell ${i + 1}</td></tr>`).join('') +
      '</tbody>' +
      '</table>'
    );
    scrollTo(editor, 0, 0);

    // Select the 1st row in the table, then make sure the toolbar appears at the bottom due to the overlap
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the bottom inside content', SugarBody.body(), bottomInsetSelector);

    // select the 4th row (middle of the viewport) and ensure it doesn't move
    TinySelections.setCursor(editor, [ 0, 0, 3, 0, 0 ], 0);
    await pAssertHasNotFlipped(bottomInsetSelector);

    // select the 8th row (bottom of the viewport) and ensure it goes back to the top due to the overlap
    TinySelections.setCursor(editor, [ 0, 0, 7, 0, 0 ], 0);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the top inside content', SugarBody.body(), topInsetSelector);

    // select the 4th row (middle of the viewport) and again ensure it doesn't move
    TinySelections.setCursor(editor, [ 0, 0, 3, 0, 0 ], 0);
    await pAssertHasNotFlipped(topInsetSelector);

    // Select the 1st row again to make sure it flips back to the bottom
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear back at the bottom inside content', SugarBody.body(), bottomInsetSelector);
  });

  it('TINY-7192: It should not flip when the selection overlaps and the user is scrolling', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<p style="padding-top: 200px"></p>' +
      '<table style="width: 100%; border-collapse: collapse;">' +
      '<tbody>' +
      Arr.range(10, (i) => `<tr style="height: 22px"><td>Cell ${i + 1}</td></tr>`).join('') +
      '</tbody>' +
      '</table>'
    );

    const pWaitForNoNodeChanges = () =>
      TinyContentActions.pWaitForEventToStopFiring(
        editor,
        'nodeChange',
        { delay: 20, timeout: 1000 }
      );

    // Select the 1st row in the table, then make sure the toolbar appears above the table
    scrollTo(editor, 0, 0);
    TinySelections.setCursor(editor, [ 1, 0, 0, 0, 0 ], 0);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the top', SugarBody.body(), topSelector);
    // Need to wait for all NodeChange events to finish firing
    await pWaitForNoNodeChanges();

    // Scroll the 1st row to the top and make sure the toolbar doesn't flip to the bottom
    scrollTo(editor, 0, 220);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the top inside content', SugarBody.body(), topInsetSelector);

    // Select the 4th row
    TinySelections.setCursor(editor, [ 1, 0, 3, 0, 0 ], 0);
    // Need to wait for all NodeChange events to finish firing
    await pWaitForNoNodeChanges();

    // Scroll the 4th row so it is now at the top and make sure the toolbar hasn't moved
    scrollTo(editor, 0, 220 + 3 * 22);
    await pAssertHasNotFlipped(topInsetSelector);
  });
});
