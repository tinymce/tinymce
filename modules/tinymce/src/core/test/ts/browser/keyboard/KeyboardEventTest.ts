import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.KeyboardEventTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TINY-10263: getModifierState exists and does not crash the editor', () => {
    const editor = hook.editor();
    let eventFired = 0;

    editor.on('keydown', (e) => {
      eventFired++;
      e.getModifierState('Shift');
    });

    TinyContentActions.keystroke(editor, Keys.enter());
    assert.equal(eventFired, 1);
  });
});
