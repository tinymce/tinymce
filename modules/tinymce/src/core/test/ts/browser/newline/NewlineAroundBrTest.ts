import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InsertNewLine from 'tinymce/core/newline/InsertNewLine';

describe('browser.tinymce.core.newline.NewlineAroundBrTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const insertNewline = (editor: Editor, args: Partial<EditorEvent<KeyboardEvent>> = {}) => {
    InsertNewLine.insert(editor, args as EditorEvent<KeyboardEvent>);
  };

  type CursorPos = [path: number[], offset: number];
  const assertNewLine = (editor: Editor, startContent: string, startCursor: CursorPos, expectedContent: string, expectedCursor: CursorPos) => {
    editor.setContent(startContent);
    TinySelections.setCursor(editor, ...startCursor);
    insertNewline(editor);
    TinyAssertions.assertContent(editor, expectedContent);
    TinyAssertions.assertCursor(editor, ...expectedCursor);
  };

  it('TINY-10384: Insert newline at |<p><br>text</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p><br>text</p>',
      [[], 0 ],
      '<p>&nbsp;</p>\n<p><br>text</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p>|<br>text</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p><br>text</p>',
      [[ 0 ], 0 ],
      '<p>&nbsp;</p>\n<p><br>text</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p><br>|text</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p><br>text</p>',
      [[ 0, 0 ], 0 ],
      '<p>&nbsp;</p>\n<p><br>text</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p><br>text|</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p><br>text</p>',
      [[ 0, 1 ], 'text'.length ],
      '<p><br>text</p>\n<p>&nbsp;</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at |<div><br>text</div>', () => {
    assertNewLine(
      hook.editor(),
      '<div><br>text</div>',
      [[], 0 ],
      '<div>&nbsp;</div>\n<div><br>text</div>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <div>|<br>text</div>', () => {
    assertNewLine(
      hook.editor(),
      '<div><br>text</div>',
      [[ 0 ], 0 ],
      '<div>&nbsp;</div>\n<div><br>text</div>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <div><br>|text</div>', () => {
    assertNewLine(
      hook.editor(),
      '<div><br>text</div>',
      [[ 0, 0 ], 0 ],
      '<div>&nbsp;</div>\n<div><br>text</div>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <div><br>text|</div>', () => {
    assertNewLine(
      hook.editor(),
      '<div><br>text</div>',
      [[ 0, 1 ],
        'text'.length ],
      '<div><br>text</div>\n<div>&nbsp;</div>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at |<p><img>text</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p><img>text</p>',
      [[], 0 ],
      '<p>&nbsp;</p>\n<p><img>text</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p>|<img>text</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p><img>text</p>',
      [[ 0 ], 0 ],
      '<p>&nbsp;</p>\n<p><img>text</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p><img>|text</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p><img>text</p>',
      [[ 0, 0 ], 0 ],
      '<p>&nbsp;</p>\n<p><img>text</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p><img>text|</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p><img>text</p>',
      [[ 0, 1 ], 'text'.length ],
      '<p><img>text</p>\n<p>&nbsp;</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p>|before<br>after</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p>before<br>after</p>',
      [[ 0, 0 ], 0 ],
      '<p>&nbsp;</p>\n<p>before<br>after</p>',
      [[ 1, 0 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p>before|<br>after</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p>before<br>after</p>',
      [[ 0, 0 ], 'before'.length ],
      '<p>before</p>\n<p><br>after</p>',
      [[ 1 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p>before<br>|after</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p>before<br>after</p>',
      [[ 0, 2 ], 0 ],
      '<p>before</p>\n<p>after</p>',
      [[ 1, 0 ], 0 ]
    );
  });

  it('TINY-10384: Insert newline at <p>before<br>after|</p>', () => {
    assertNewLine(
      hook.editor(),
      '<p>before<br>after</p>',
      [[ 0, 2 ], 'after'.length ],
      '<p>before<br>after</p>\n<p>&nbsp;</p>',
      [[ 1 ], 0 ]
    );
  });
});