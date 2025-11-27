import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyContentActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.newline.NewlineInLiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('TINY-12102: pressing enter in p inside li should insert nbsp in new li', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>'
        + '<li><p>One</p></li>'
        + '<li>'
          + '<p>Two</p>'
          + '<ul>'
            + '<li>One sub</li>'
            + '<li>Two sub</li>'
          + '</ul>'
        + '</li>'
      + '</ul>'
    );
    TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 'Two'.length);
    TinyContentActions.keydown(editor, Keys.enter());

    const expectedContent = [ '<ul>',
      '<li>',
      '<p>One</p>',
      '</li>',
      '<li>',
      '<p>Two</p>',
      '</li>',
      '<li>',
      '<p>&nbsp;</p>',
      '<ul>',
      '<li>One sub</li>',
      '<li>Two sub</li>',
      '</ul>',
      '</li>',
      '</ul>' ].join('\n');
    TinyAssertions.assertContent(editor, expectedContent);
    TinyAssertions.assertCursor(editor, [ 0, 2, 0, 0 ], 0);
  });

  it('TINY-12102: pressing enter in div inside li should insert nbsp in new li', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>'
        + '<li><div>Item1</div></li>'
        + '<li>'
          + '<div>Item2'
              + '<ul>'
                + '<li>level2</li>'
                + '<li>level2</li>'
                + '<li>level2</li>'
              + '</ul>'
            + '</div>'
        + '</li>'
        + '<li><div>Item3</div></li>'
      + '</ul>'
    );
    TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 'Item2'.length);
    TinyContentActions.keydown(editor, Keys.enter());

    const expectedContent = [ '<ul>',
      '<li>',
      '<div>Item1</div>',
      '</li>',
      '<li>',
      '<div>Item2</div>',
      '</li>',
      '<li>',
      '<div>&nbsp;',
      '<ul>',
      '<li>level2</li>',
      '<li>level2</li>',
      '<li>level2</li>',
      '</ul>',
      '</div>',
      '</li>',
      '<li>',
      '<div>Item3</div>',
      '</li>',
      '</ul>' ].join('\n');
    TinyAssertions.assertContent(editor, expectedContent);
    TinyAssertions.assertCursor(editor, [ 0, 2, 0, 0 ], 0);
  });

  it('TINY-12102: pressing enter in multiple nested spans in p inside li should insert nbsp in new li', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>'
        + '<li><p>One</p></li>'
        + '<li>'
         + '<p>'
            + '<span style="font-size: 24pt;">'
              + '<span style="background: red;">'
                + 'Two'
              + '</span>'
            + '</span>'
          + '</p>'
          + '<ul>'
            + '<li>One sub</li>'
            + '<li>Two sub</li>'
          + '</ul>'
        + '</li>'
      + '</ul>'
    );
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0, 0 ], 'Two'.length);
    TinyContentActions.keydown(editor, Keys.enter());

    const expectedContent = [ '<ul>',
      '<li>',
      '<p>One</p>',
      '</li>',
      '<li>',
      '<p><span style="font-size: 24pt;"><span style="background: red;">Two</span></span></p>',
      '</li>',
      '<li>',
      '<p><span style="font-size: 24pt;"><span style="background: red;">&nbsp;</span></span></p>',
      '<ul>',
      '<li>One sub</li>',
      '<li>Two sub</li>',
      '</ul>',
      '</li>',
      '</ul>' ].join('\n');
    TinyAssertions.assertContent(editor, expectedContent);
    TinyAssertions.assertCursor(editor, [ 0, 2, 0, 0, 0, 0 ], 0);
  });

  it('TINY-12830: should split list item at cursor position when pressing enter', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>This is a paragraph</li></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'Th'.length);
    TinyContentActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContent(editor, [ '<ul>', '<li>Th</li>', '<li>is is a paragraph</li>', '</ul>' ].join('\n'));
    TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
  });

  it('TINY-12830: should split list item using mceInsertNewline command without throwing error', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>This is a paragraph</li></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'Th'.length);
    assert.doesNotThrow(() => editor.execCommand('mceInsertNewline'));
    TinyAssertions.assertContent(editor, [ '<ul>', '<li>Th</li>', '<li>is is a paragraph</li>', '</ul>' ].join('\n'));
    TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 0);
  });

  it('TINY-13224: font-size should be applied to a new list item in a unordered list when pressing Enter key', () => {
    const editor = hook.editor();
    editor.setContent(
      `<ul>
        <li style="font-size: 24pt;">This is a paragraph</li>
      </ul>`
    );
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'This is a paragraph'.length);
    TinyContentActions.keydown(editor, Keys.enter());

    TinyAssertions.assertContent(editor, [ '<ul>', '<li style="font-size: 24pt;">This is a paragraph</li>', '<li style="font-size: 24pt;">&nbsp;</li>', '</ul>' ].join('\n'));
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
  });

  it('TINY-13224: font-size should be applied to a new list item in an ordered list when pressing Enter key', () => {
    const editor = hook.editor();
    editor.setContent(
      `<ol>
        <li style="font-size: 20pt;">This is a paragraph</li>
      </ol>`
    );
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'This is a paragraph'.length);
    TinyContentActions.keydown(editor, Keys.enter());

    TinyAssertions.assertContent(editor, [ '<ol>', '<li style="font-size: 20pt;">This is a paragraph</li>', '<li style="font-size: 20pt;">&nbsp;</li>', '</ol>' ].join('\n'));
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
  });
});
