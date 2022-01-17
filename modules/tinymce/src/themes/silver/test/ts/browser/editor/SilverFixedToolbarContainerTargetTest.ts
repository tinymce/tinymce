import { Assertions } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.SilverFixedToolbarContainerTargetTest', () => {
  const toolbar: SugarElement<HTMLDivElement> = SugarElement.fromHtml('<div style="margin: 50px 0;"></div>');
  before(() => {
    Insert.append(SugarBody.body(), toolbar);
  });

  after(() => {
    Remove.remove(toolbar);
  });

  const hook = TinyHooks.bddSetup<Editor>({
    inline: true,
    fixed_toolbar_container_target: toolbar.dom,
    menubar: 'file',
    toolbar: 'undo bold',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('Check fixed_toolbar_container_target setting for inline editor', async () => {
    const editor = hook.editor();
    editor.setContent('fixed_toolbar_container_target test');
    editor.focus();

    await TinyUiActions.pWaitForUi(editor, '.tox-editor-header');
    Assertions.assertPresence('Check that the inline toolbar exists', { '.tox-tinymce-inline': 1 }, SugarBody.body());
  });
});
