import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/template/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { pInsertTemplate } from '../module/InsertTemplate';
import { Settings } from '../module/Settings';

describe('browser.tinymce.plugins.template.DatesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'template',
    toolbar: 'template',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const { addSettings, cleanupSettings } = Settings(hook);

  afterEach(() => {
    const editor = hook.editor();
    cleanupSettings();
    editor.setContent('');
  });

  it('TBA: Test cdate in snippet with default class', async () => {
    const editor = hook.editor();
    addSettings({
      templates: [{ title: 'a', description: 'b', content: '<p class="cdate">x</p>' }],
      template_cdate_format: 'fake date',
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, '<p class="cdate">fake date</p>');
  });

  it('TBA: Test cdate in snippet with custom class', async () => {
    const editor = hook.editor();
    addSettings({
      template_cdate_classes: 'customCdateClass',
      templates: [{ title: 'a', description: 'b', content: '<p class="customCdateClass">x</p>' }],
      template_cdate_format: 'fake date'
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor,
      '<p class="customCdateClass">fake date</p>'
    );
  });

  it('TBA: Test mdate updates with each serialization', async () => {
    const editor = hook.editor();
    addSettings({
      template_mdate_format: 'fake modified date',
      template_cdate_format: 'fake created date',
      templates: [{ title: 'a', description: 'b', content: '<div class="mceTmpl"><p class="mdate"></p><p class="cdate"></p></div>' }]
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, [
      '<div class="mceTmpl">',
      '<p class="mdate">fake modified date</p>',
      '<p class="cdate">fake created date</p>',
      '</div>'
    ].join('\n'));
    addSettings({ template_mdate_format: 'changed modified date' });
    TinyAssertions.assertContent(editor, [
      '<div class="mceTmpl">',
      '<p class="mdate">changed modified date</p>',
      '<p class="cdate">fake created date</p>',
      '</div>'
    ].join('\n'));
  });

  it('TBA: Test mdate updates with each serialization with custom class', async () => {
    const editor = hook.editor();
    addSettings({
      template_mdate_classes: 'modified',
      template_mdate_format: 'fake modified date',
      template_cdate_format: 'fake created date',
      templates: [{ title: 'a', description: 'b', content: '<div class="mceTmpl"><p class="modified"></p><p class="cdate"></p></div>' }]
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, [
      '<div class="mceTmpl">',
      '<p class="modified">fake modified date</p>',
      '<p class="cdate">fake created date</p>',
      '</div>'
    ].join('\n'));
    addSettings({ template_mdate_format: 'changed modified date' });
    TinyAssertions.assertContent(editor, [
      '<div class="mceTmpl">',
      '<p class="modified">changed modified date</p>',
      '<p class="cdate">fake created date</p>',
      '</div>'
    ].join('\n'));
  });
});
