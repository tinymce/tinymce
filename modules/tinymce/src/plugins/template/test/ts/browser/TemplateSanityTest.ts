import { UiFinder } from '@ephox/agar';
import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/template/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { pInsertTemplate } from '../module/InsertTemplate';
import { Settings } from '../module/Settings';

describe('browser.tinymce.plugins.template.TemplateSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'template',
    toolbar: 'template',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const { addSettings, cleanupSettings } = Settings(hook);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  afterEach(() => {
    cleanupSettings();
  });

  it('TBA: Test basic template insertion', async () => {
    const editor = hook.editor();
    addSettings({
      templates: [{ title: 'a', description: 'b', content: '<strong>c</strong>' }],
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, '<p><strong>c</strong></p>');
  });

  it('TBA: Test basic content replacement', async () => {
    const editor = hook.editor();
    addSettings({
      template_replace_values: { name: 'Tester', email: 'test@test.com' },
      templates: [{ title: 'a', description: 'b', content: '<p>{$name} {$email}</p>' }]
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, '<p>Tester test@test.com</p>');
  });

  it('TBA: Test loading in snippet from other file', async () => {
    const editor = hook.editor();
    addSettings({
      templates: [{ title: 'a', description: '<strong>b</strong>', url: '/project/tinymce/src/plugins/template/test/html/test_template.html' }]
    });
    await pInsertTemplate(editor, async (dialogEl) => {
      await UiFinder.pWaitForState('iframe is loaded', dialogEl, 'iframe', (elm) => {
        const iframeDoc = elm.dom.contentDocument || elm.dom.contentWindow.document;
        return iframeDoc.body.firstChild !== null;
      });
      UiFinder.exists(dialogEl, 'p:contains("<strong>b</strong>")');
    });
    TinyAssertions.assertContent(editor, '<p><em>this is external</em></p>');
  });

  it('TBA: Test command', () => {
    const editor = hook.editor();
    addSettings({
      template_replace_values: { name: 'Tester', email: 'test@test.com' },
    });
    editor.execCommand('mceInsertTemplate', false, '<p>{$name}</p>');
    TinyAssertions.assertContent(editor, '<p>Tester</p>');
  });
});
