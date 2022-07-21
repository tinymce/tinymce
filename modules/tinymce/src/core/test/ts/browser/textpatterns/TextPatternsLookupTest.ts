import { Keys } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { DynamicPatternContext } from 'tinymce/core/textpatterns/core/PatternTypes';

describe('browser.tinymce.textpatterns.TextPatternsLookupTest', () => {
  const store = TestHelpers.TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    text_patterns: [
      { start: '**', end: '**', format: 'bold' }
    ],
    base_url: '/project/tinymce/js/tinymce',
    text_patterns_lookup: (ctx: DynamicPatternContext) => {
      store.add(ctx.text);
      return [
        { start: '**', end: '**', format: 'italic' }
      ];
    }
  }, [ ]);

  const setUpContentAndMoveCursor = (editor: Editor, content: string, path: number[], offset: number) => {
    editor.setContent(`<p>${content}</p>`);
    editor.focus();
    TinySelections.setCursor(editor, path, offset);
  };

  beforeEach(() => {
    store.clear();
  });

  it('TINY-8778: should only be called once when pressing enter key', () => {
    const editor = hook.editor();
    setUpContentAndMoveCursor(hook.editor(), 'brb', [ 0, 0 ], 3 );
    TinyContentActions.keystroke(editor, Keys.enter());
    store.assertEq('should only be called once', [ 'brb' ]);
  });

  it('TINY-8778: should only be called once when pressing space key', () => {
    const editor = hook.editor();
    setUpContentAndMoveCursor(hook.editor(), '**brb**', [ 0, 0 ], 7);
    TinyContentActions.keyup(editor, Keys.space());
    store.assertEq('should only be called once', [ '**brb**' ]);
  });
});
