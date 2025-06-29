import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

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
});
