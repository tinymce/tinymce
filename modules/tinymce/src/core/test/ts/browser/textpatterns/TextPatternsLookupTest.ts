import { Keys } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { DynamicPatternContext } from 'tinymce/core/textpatterns/core/PatternTypes';

describe('browser.tinymce.textpatterns.TextPatternsLookupTest', () => {
  context('Number of times text_patterns_lookup is called', () => {
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

    const setUp = (editor: Editor, content: string, path: number[], offset: number) => {
      editor.setContent(`<p>${content}</p>`);
      editor.focus();
      TinySelections.setCursor(editor, path, offset);
    };

    beforeEach(() => {
      store.clear();
    });

    it('Twice on pressing enter key', () => {
      const editor = hook.editor();
      setUp(hook.editor(), 'brb', [ 0, 0 ], 3 );
      TinyContentActions.keystroke(editor, Keys.enter());
      store.assertEq('should be called twiced', [ 'brb', 'brb' ]);
    });

    it('Once on pressing space key', () => {
      const editor = hook.editor();
      setUp(hook.editor(), '**brb**', [ 0, 0 ], 7);
      TinyContentActions.keyup(editor, Keys.space());
      store.assertEq('should be called only once', [ '**brb**' ]);
    });
  });
});
