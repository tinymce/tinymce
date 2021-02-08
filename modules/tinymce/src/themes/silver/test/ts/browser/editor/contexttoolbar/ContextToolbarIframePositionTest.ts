import { Keys, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyContentActions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { Css, Scroll, SugarBody } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { getGreenImageDataUrl } from '../../../module/Assets';

interface Scenario {
  readonly label: string;
  readonly content: string;
  readonly contentStyles?: string;
  readonly cursor: {
    readonly elementPath: number[];
    readonly offset: number;
  };
  readonly classes: string;
}

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarIFramePosition test', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'fullscreen',
    toolbar: 'fullscreen',
    height: 400,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body, p { margin: 0; }',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('alpha', {
        text: 'Alpha',
        onAction: Fun.noop
      });
      ed.ui.registry.addContextToolbar('test-selection-toolbar', {
        predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'a',
        items: 'alpha'
      });
      ed.ui.registry.addContextToolbar('test-node-toolbar', {
        predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'img',
        items: 'alpha',
        position: 'node'
      });
      ed.ui.registry.addContextToolbar('test-line-toolbar', {
        predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'div',
        items: 'alpha',
        position: 'line'
      });
    }
  }, [ FullscreenPlugin, Theme ], true);

  const scrollTo = (editor: Editor, x: number, y: number) =>
    Scroll.to(x, y, TinyDom.document(editor));

  const pAssertPosition = (position: string, value: number, diff = 5) => Waiter.pTryUntil('Wait for toolbar to be positioned', () => {
    const ele = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    const styles = parseInt(Css.getRaw(ele, position).getOr('0').replace('px', ''), 10);
    assert.approximately(styles, value, diff, `Assert toolbar position - ${position} ${styles}px ~= ${value}px`);
  });

  const pAssertFullscreenPosition = (position: string, value: number, diff = 5) => Waiter.pTryUntil('Wait for toolbar to be positioned', () => {
    const ele = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    // The context toolbar is positioned relative to the sink, so the value can change between browsers due to different default styles
    // as such we can't reliably test using the actual top/bottom position, so use the bounding client rect instead.
    const pos = ele.dom.getBoundingClientRect();
    assert.approximately(pos[position], value, diff, `Assert toolbar position - ${position} ${pos[position]}px ~= ${value}px`);
  });

  const pWaitForToolbarHidden = () => UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');

  const testPositionWhileScrolling = (scenario: Scenario) => {
    it(scenario.label, async () => {
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
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), '.tox-pop.tox-pop--bottom' + scenario.classes);
      await pAssertPosition('bottom', 232);

      // Position the link at the top of the viewport, just below the toolbar
      scrollTo(editor, 0, 300);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), '.tox-pop.tox-pop--top' + scenario.classes);
      await pAssertPosition('top', -289);

      // Position the behind the menu/toolbar and check the context toolbar is hidden
      scrollTo(editor, 0, 400);
      await pWaitForToolbarHidden();

      // Position the element back into view
      scrollTo(editor, 0, 200);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), '.tox-pop.tox-pop--bottom' + scenario.classes);
      await pAssertPosition('bottom', 232);

      // Position the element off the top of the screen and check the context toolbar is hidden
      scrollTo(editor, 0, 600);
      await pWaitForToolbarHidden();
    });
  };

  const fullscreenSelector = '.tox.tox-fullscreen';
  const fullscreenButtonSelector = 'button[aria-label="Fullscreen"]';

  context('Context toolbar selection position while scrolling', () => {
    // north/south
    testPositionWhileScrolling({
      label: 'north to south to hidden',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      cursor: {
        elementPath: [ 3, 1, 0 ],
        offset: 1
      },
      classes: ''
    });

    // northeast/southeast
    testPositionWhileScrolling({
      label: 'northeast to southeast to hidden',
      content: '<a href="http://tiny.cloud">link</a> Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      cursor: {
        elementPath: [ 3, 0, 0 ],
        offset: 1
      },
      classes: '.tox-pop--align-left'
    });

    // northeast/southeast
    testPositionWhileScrolling({
      label: 'northwest to southwest to hidden',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      contentStyles: 'text-align: right',
      cursor: {
        elementPath: [ 3, 1, 0 ],
        offset: 4
      },
      classes: '.tox-pop--align-right'
    });
  });

  it('TBA: Context toolbar falls back to positioning inside the content', async () => {
    const editor = hook.editor();
    editor.setContent(`<p><img src="${getGreenImageDataUrl()}" style="height: 380px; width: 100px"></p>`);
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear to top inside content', SugarBody.body(), '.tox-pop.tox-pop--top');
    await pAssertPosition('top', -309);
    TinySelections.setCursor(editor, [ 0 ], 1);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyContentActions.keystroke(editor, Keys.enter());
    editor.nodeChanged();
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), '.tox-pop.tox-pop--top');
    await pAssertPosition('top', -56);
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
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear', SugarBody.body(), '.tox-pop.tox-pop--left');
    await pAssertPosition('top', -155);

    // Scroll so div is below the status bar
    scrollTo(editor, 0, 50);
    await pWaitForToolbarHidden();

    // Bottom
    scrollTo(editor, 0, 100);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear', SugarBody.body(), '.tox-pop.tox-pop--left');
    await pAssertPosition('top', -40);

    // Scroll so div is behind header
    scrollTo(editor, 0, 450);
    await pWaitForToolbarHidden();

    // Top
    scrollTo(editor, 0, 420);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear', SugarBody.body(), '.tox-pop.tox-pop--left');
    await pAssertPosition('top', -321);
  });

  it('TINY-4023: Context toolbar is visible in fullscreen mode', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, fullscreenButtonSelector);
    TinyUiActions.pWaitForUi(editor, fullscreenSelector);
    editor.setContent(`<p><img src="${getGreenImageDataUrl()}" style="height: 380px; width: 100px"></p>`);
    TinySelections.select(editor, 'img', []);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear to top inside content', SugarBody.body(), '.tox-pop.tox-pop--top');
    await pAssertFullscreenPosition('top', 470);
    await UiFinder.pWaitForVisible('Check toolbar is still visible', SugarBody.body(), '.tox-pop.tox-pop--top');
    TinyUiActions.clickOnToolbar(editor, fullscreenButtonSelector);
    await Waiter.pTryUntil('Wait for fullscreen to turn off', () => UiFinder.notExists(SugarBody.body(), fullscreenSelector));
  });

  it('TBA: Context toolbar should hide when scrolled out of view', async () => {
    const editor = hook.editor();
    Css.set(TinyDom.container(editor), 'margin-bottom', '5000px');
    editor.setContent('<p><a href="http://tiny.cloud">link</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), '.tox-pop.tox-pop--top');
    await Waiter.pWait(250); // TODO: Find out why Safari fails without this wait
    window.scrollTo(0, 2000);
    await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');
    Css.remove(TinyDom.container(editor), 'margin-bottom');
  });
});
