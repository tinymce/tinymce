import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Class, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('headless.tinymce.themes.silver.toolbar.ToolbarLabelTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addToolbarLabel('test-label', {
        icon: 'checkmark',
        text: 'abc'
      });

      ed.ui.registry.addContextToolbar('test-toolbar', {
        predicate: Fun.never,
        items: 'test-label'
      });
    }
  }, [], true);

  it('should render the toolbar label', async () => {
    const editor = hook.editor();
    editor.dispatch('contexttoolbar-show', {
      toolbarKey: 'test-toolbar'
    });
    await UiFinder.pWaitForState(
      'the toolbar label should exist and has a text and an icon',
      SugarBody.body(),
      '.tox-toolbar [data-mce-name="test-label"]', (label) => {
        const firstChild = label.dom.firstChild;
        return firstChild !== null && Class.has(SugarElement.fromDom(firstChild), 'tox-icon') && label.dom.lastChild?.textContent === 'abc';
      });
  });

});
