import { UiFinder, Waiter } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/mcagar';
import { Css, Scroll, SugarBody, SugarLocation } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

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

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarInlinePositionTest', () => {
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
        predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'a',
        items: 'alpha'
      });
    }
  }, [ Theme ], true);

  before(() => {
    Css.setAll(TinyDom.contentAreaContainer(hook.editor()), {
      'margin-top': '1500px',
      'margin-bottom': '1500px'
    });
  });

  const scrollTo = (editor: Editor, x: number, y: number) => {
    const editorPos = SugarLocation.absolute(TinyDom.contentAreaContainer(editor));
    // Note: Add 100px for the top para
    Scroll.to(editorPos.left + x, editorPos.top + 100 + y);
  };

  const pAssertPosition = (position: string, direction: string, value: number, diff = 5) => Waiter.pTryUntil('Wait for toolbar to be positioned', () => {
    const ele = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    const posStyle = Css.get(ele, 'position');
    const dirStyle = parseInt(Css.getRaw(ele, direction).getOr('0').replace('px', ''), 10);
    assert.equal(posStyle, position, 'Assert toolbar positioning');
    assert.approximately(dirStyle, value, diff, `Assert toolbar position - ${direction} ${dirStyle}px ~= ${value}px`);
  });

  const testPositionWhileScrolling = (scenario: Scenario) => {
    it(scenario.label, async () => {
      const editor = hook.editor();
      editor.setContent(`<p style="height: 100px"></p><p style="height: 25px;${scenario.contentStyles || ''}">${scenario.content}</p><p style="height: 100px"></p>`);
      scrollTo(editor, 0, -250);
      TinySelections.setCursor(editor, scenario.cursor.elementPath, scenario.cursor.offset);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), '.tox-pop.tox-pop--bottom' + scenario.classes);
      await pAssertPosition('absolute', 'bottom', 1637);

      // Position the link at the top of the viewport, just below the toolbar
      scrollTo(editor, 0, -80);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), '.tox-pop.tox-pop--top' + scenario.classes);
      await pAssertPosition('fixed', 'top', 109);

      // Position the element offscreen and check the toolbar is hidden
      scrollTo(editor, 0, 100);
      await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');

      // Position the element back into view
      scrollTo(editor, 0, -250);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), '.tox-pop.tox-pop--bottom' + scenario.classes);
      await pAssertPosition('absolute', 'bottom', 1637);

      // Position the element behind the docked toolbar and check the toolbar is hidden
      scrollTo(editor, 0, -10);
      await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');
    });
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
    testPositionWhileScrolling({
      label: 'north to south to hidden',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      cursor: {
        elementPath: [ 1, 1, 0 ],
        offset: 1
      },
      classes: ''
    });

    // northeast/southeast
    testPositionWhileScrolling({
      label: 'northeast to southeast to hidden',
      content: '<a href="http://tiny.cloud">link</a> Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      cursor: {
        elementPath: [ 1, 0, 0 ],
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
        elementPath: [ 1, 1, 0 ],
        offset: 4
      },
      classes: '.tox-pop--align-right'
    });
  });
});
