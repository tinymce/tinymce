import { UiFinder, Waiter } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Css, Scroll, SugarBody, SugarLocation } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

interface Scenario {
  readonly content: string;
  readonly contentStyles?: string;
  readonly cursor: {
    readonly elementPath: number[];
    readonly offset: number;
  };
  readonly classes: string;
}

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarInlinePositionTest', () => {
  const topSelector = '.tox-pop.tox-pop--bottom:not(.tox-pop--inset):not(.tox-pop--transition)';
  const bottomSelector = '.tox-pop.tox-pop--top:not(.tox-pop--inset):not(.tox-pop--transition)';
  const topInsetSelector = '.tox-pop.tox-pop--top.tox-pop--inset:not(.tox-pop--transition)';
  const bottomInsetSelector = '.tox-pop.tox-pop--bottom.tox-pop--inset:not(.tox-pop--transition)';

  const hook = TinyHooks.bddSetup<Editor>({
    inline: true,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'p { margin: 0; }',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('alpha', {
        text: 'Alpha',
        onAction: Fun.noop
      });
      ed.ui.registry.addContextToolbar('test-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'a',
        items: 'alpha'
      });
      ed.ui.registry.addContextToolbar('test-table-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'table',
        items: 'alpha',
        position: 'node'
      });
      Arr.each([ 'beta', 'gamma', 'delta' ], (name) => {
        ed.ui.registry.addButton(name, {
          text: name.charAt(0).toUpperCase() + name.slice(1),
          onAction: Fun.noop
        });
      });
      // TINY-13900: Deliberately wide, so that it is wider than the narrow node it anchors to
      ed.ui.registry.addContextToolbar('test-image-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'img',
        items: 'alpha beta gamma delta',
        position: 'node'
      });
    }
  }, [], true);

  before(() => {
    Css.setAll(TinyDom.contentAreaContainer(hook.editor()), {
      'margin-top': '1500px',
      'margin-bottom': '1500px'
    });
  });

  const scrollTo = (editor: Editor, x: number, y: number, offset = 0) => {
    const editorPos = SugarLocation.absolute(TinyDom.contentAreaContainer(editor));
    // Note: Add 100px for the top para
    Scroll.to(editorPos.left + x, editorPos.top + offset + y);
  };

  const pAssertPosition = (position: string, direction: string, value: number, diff = 5) => Waiter.pTryUntil('Wait for toolbar to be positioned', () => {
    const ele = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    const posStyle = Css.get(ele, 'position');
    const dirStyle = parseInt(Css.getRaw(ele, direction).getOr('0').replace('px', ''), 10);
    assert.equal(posStyle, position, 'Assert toolbar positioning');
    assert.approximately(dirStyle, value, diff, `Assert toolbar position - ${direction} ${dirStyle}px ~= ${value}px`);
  });

  const pTestPositionWhileScrolling = (scenario: Scenario) => async () => {
    const editor = hook.editor();
    const offset = 100;
    editor.setContent(`<p style="height: ${offset}px"></p><p style="height: 25px;${scenario.contentStyles || ''}">${scenario.content}</p><p style="height: 100px"></p>`);
    scrollTo(editor, 0, -250, offset);
    TinySelections.setCursor(editor, scenario.cursor.elementPath, scenario.cursor.offset);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), topSelector + scenario.classes);
    await pAssertPosition('absolute', 'bottom', 1637);

    // Position the link at the top of the viewport, just below the toolbar
    scrollTo(editor, 0, -80, offset);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), bottomSelector + scenario.classes);
    await pAssertPosition('fixed', 'top', 109);

    // Position the element offscreen and check the toolbar is hidden
    scrollTo(editor, 0, 100, offset);
    await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');

    // Position the element back into view
    scrollTo(editor, 0, -250, offset);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), topSelector + scenario.classes);
    await pAssertPosition('absolute', 'bottom', 1637);

    // Position the element behind the docked toolbar and check the toolbar is hidden
    scrollTo(editor, 0, -10, offset);
    await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');
  };

  it('TBA: Context toolbar position', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud">link</a></p>');
    scrollTo(editor, 0, -250);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear below the content area container', SugarBody.body(), '.tox-pop.tox-pop--top.tox-pop--align-left');
    await pAssertPosition('absolute', 'top', -1489);
  });

  context('TBA: Context toolbar position while scrolling', () => {
    // north/south
    it('north to south to hidden', pTestPositionWhileScrolling({
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      cursor: {
        elementPath: [ 1, 1, 0 ],
        offset: 1
      },
      classes: ''
    }));

    // northeast/southeast
    it('northeast to southeast to hidden', pTestPositionWhileScrolling({
      content: '<a href="http://tiny.cloud">link</a> Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      cursor: {
        elementPath: [ 1, 0, 0 ],
        offset: 1
      },
      classes: '.tox-pop--align-left'
    }));

    // northeast/southeast
    it('northwest to southwest to hidden', pTestPositionWhileScrolling({
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      contentStyles: 'text-align: right',
      cursor: {
        elementPath: [ 1, 1, 0 ],
        offset: 4
      },
      classes: '.tox-pop--align-right'
    }));
  });

  it('TINY-7192: Toolbar should flip to the opposite position when the selection overlaps', async () => {
    const editor = hook.editor();
    const toolbarHeight = 80;
    editor.setContent(
      '<table style="width: 100%; border-collapse: collapse;">' +
      '<tbody>' +
      Arr.range(100, (i) => `<tr style="height: 22px"><td>Cell ${i + 1}</td></tr>`).join('') +
      '</tbody>' +
      '</table>'
    );

    // Scroll so the 5th row is at the top and select an initial position that's not at the top (15th row)
    scrollTo(editor, 0, 4 * 22 - toolbarHeight);
    TinySelections.setCursor(editor, [ 0, 0, 14, 0, 0 ], 0);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the top inside content', SugarBody.body(), topInsetSelector);

    // Select the 5th row in the table, then make sure the toolbar appears at the bottom due to the overlap
    TinySelections.setCursor(editor, [ 0, 0, 4, 0, 0 ], 0);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear at the bottom inside content', SugarBody.body(), bottomInsetSelector);
  });

  it('TINY-13900: Node toolbar stays attached to a node that is narrower than the toolbar and flush with the content area edge', async () => {
    const editor = hook.editor();
    editor.setContent('<p style="height: 300px"></p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="width: 20px; height: 20px"></p><p style="height: 300px"></p>');
    scrollTo(editor, 0, -200, 300);
    TinySelections.select(editor, 'img', []);

    await UiFinder.pWaitForVisible('Waiting for a non-inset toolbar above the image', SugarBody.body(), topSelector);
    await Waiter.pTryUntil('Toolbar should be aligned to the left edge of the image', () => {
      const pop = UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-pop').getOrDie();
      const image = UiFinder.findIn<HTMLElement>(TinyDom.body(editor), 'img').getOrDie();
      assert.approximately(
        pop.dom.getBoundingClientRect().left,
        image.dom.getBoundingClientRect().left,
        2,
        'Toolbar left should line up with the image left'
      );
    });
  });
});
