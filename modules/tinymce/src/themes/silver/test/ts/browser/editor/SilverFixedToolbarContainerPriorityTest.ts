import { Assertions } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.SilverFixedToolbarContainerPriorityTest', () => {
  const toolbar: SugarElement<HTMLDivElement> = SugarElement.fromHtml('<div style="margin: 50px 0;"></div>');
  const toolbarWithId: SugarElement<HTMLDivElement> = SugarElement.fromHtml('<div id="toolbar" style="margin: 50px 0;"></div>');
  before(() => {
    Insert.append(SugarBody.body(), toolbar);
    Insert.append(SugarBody.body(), toolbarWithId);
  });

  after(() => {
    Remove.remove(toolbar);
    Remove.remove(toolbarWithId);
  });

  const hook = TinyHooks.bddSetup<Editor>({
    inline: true,
    fixed_toolbar_container_target: toolbar.dom,
    fixed_toolbar_container: '#toolbar',
    menubar: 'file',
    toolbar: 'undo bold',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('Check priority of fixed_toolbar_container(_target) setting', async () => {
    const editor = hook.editor();
    editor.setContent('fixed_toolbar_container_target priority test');
    editor.focus();

    await TinyUiActions.pWaitForUi(editor, '#toolbar .tox-editor-header');
    Assertions.assertPresence('Check that only one toolbar exists', { '.tox-editor-header': 1 }, SugarBody.body());
  });
});
