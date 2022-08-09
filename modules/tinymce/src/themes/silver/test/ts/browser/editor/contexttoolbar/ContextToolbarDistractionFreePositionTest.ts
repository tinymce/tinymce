import { UiFinder } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Css, Scroll, SugarBody, SugarLocation } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface Scenario {
  readonly content: string;
  readonly contentStyles?: string;
  readonly cursor: {
    readonly elementPath: number[];
    readonly offset: number;
  };
  readonly classes: string;
}

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarDistractionFreePositionTest', () => {
  const topSelector = '.tox-pop.tox-pop--bottom:not(.tox-pop--inset):not(.tox-pop--transition)';
  const bottomSelector = '.tox-pop.tox-pop--top:not(.tox-pop--inset):not(.tox-pop--transition)';

  const hook = TinyHooks.bddSetup<Editor>({
    toolbar: false,
    menubar: false,
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
    }
  }, [], true);

  before(() => {
    Css.setAll(TinyDom.contentAreaContainer(hook.editor()), {
      'margin-top': '1500px',
      'margin-bottom': '1500px'
    });
  });

  const scrollTo = (editor: Editor, x: number, y: number) => {
    const editorPos = SugarLocation.absolute(TinyDom.contentAreaContainer(editor));
    Scroll.to(editorPos.left + x, editorPos.top + y);
  };

  const assertPosition = (position: string, value: number, diff = 5) => {
    const ele = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    const styles = parseInt(Css.getRaw(ele, position).getOr('0').replace('px', ''), 10);
    assert.approximately(styles, value, diff, `Assert toolbar position - ${position} ${styles}px ~= ${value}px`);
  };

  const pTestPositionWhileScrolling = (scenario: Scenario) => async () => {
    const editor = hook.editor();
    editor.setContent(`<p style="height: 25px;${scenario.contentStyles || ''}">${scenario.content}</p>`);
    scrollTo(editor, 0, -250);
    TinySelections.setCursor(editor, scenario.cursor.elementPath, scenario.cursor.offset);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), topSelector + scenario.classes);
    assertPosition('bottom', 1537);

    // Position the link at the top of the viewport
    scrollTo(editor, 0, 0);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear below content', SugarBody.body(), bottomSelector + scenario.classes);
    assertPosition('top', -1496);

    // Position the element off the bottom of the screen and check the toolbar is hidden
    scrollTo(editor, 0, 100);
    await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');

    // Position the element just back into view
    scrollTo(editor, 0, -60);
    await UiFinder.pWaitForVisible('Waiting for toolbar to appear above content', SugarBody.body(), topSelector + scenario.classes);
    assertPosition('bottom', 1537);

    // Position the element off the top of the screen and check the toolbar is hidden
    scrollTo(editor, 0, 1000);
    await UiFinder.pWaitForHidden('Waiting for toolbar to be hidden', SugarBody.body(), '.tox-pop');
  };

  context('Context toolbar position while scrolling', () => {
    // north/south
    it('north to south to hidden', pTestPositionWhileScrolling({
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      cursor: {
        elementPath: [ 0, 1, 0 ],
        offset: 1
      },
      classes: ''
    }));

    // northeast/southeast
    it('northeast to southeast to hidden', pTestPositionWhileScrolling({
      content: '<a href="http://tiny.cloud">link</a> Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      cursor: {
        elementPath: [ 0, 0, 0 ],
        offset: 1
      },
      classes: '.tox-pop--align-left'
    }));

    // northeast/southeast
    it('northwest to southwest to hidden', pTestPositionWhileScrolling({
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
      contentStyles: 'text-align: right',
      cursor: {
        elementPath: [ 0, 1, 0 ],
        offset: 4
      },
      classes: '.tox-pop--align-right'
    }));
  });
});
