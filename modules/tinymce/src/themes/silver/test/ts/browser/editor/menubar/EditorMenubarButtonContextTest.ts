import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.menubar.EditorMenubarButtonContextTest', () => {
  const registerMode = (ed: Editor) => {
    ed.mode.register('testmode', {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: {
        selectionEnabled: true
      }
    });
  };

  const assertMenuEnabled = (menu: string) => {
    const menuButton = UiFinder.findIn(SugarBody.body(), `.tox-mbtn:contains("${menu}")`).getOrDie();
    assert.equal(Attribute.get(menuButton, 'disabled'), undefined, 'Should not be disabled');
  };

  const assertMenuDisabled = (menu: string) => {
    const menuButton = UiFinder.findIn(SugarBody.body(), `.tox-mbtn:contains("${menu}")`).getOrDie();
    assert.equal(Attribute.get(menuButton, 'disabled'), 'disabled', 'Should be disabled');
  };

  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 't1 t2 t3 t4',
    statusbar: false,
    menubar: 'file menutest',
    menu: {
      file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
      menutest: { title: 'test', items: 'x1 x2 x3 x4 preferences' }
    },
    setup: (ed: Editor) => {
      registerMode(ed);
    }
  }, [], true);

  it('TINY-11211: Menu bar buttons should always be enabled in uiEnabled mode', () => {
    const editor = hook.editor();

    editor.mode.set('design');
    assertMenuEnabled('File');

    editor.mode.set('testmode');
    assertMenuEnabled('File');

    editor.mode.set('readonly');
    assertMenuDisabled('File');

    editor.mode.set('testmode');
    assertMenuEnabled('File');

    editor.mode.set('design');
    assertMenuEnabled('File');
  });
});
