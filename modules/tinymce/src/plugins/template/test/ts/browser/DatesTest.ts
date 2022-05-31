import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/template/Plugin';

import { pInsertTemplate } from '../module/InsertTemplate';
import { Settings } from '../module/Settings';

describe('browser.tinymce.plugins.template.DatesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'template',
    toolbar: 'template',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

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

  it('TBA: Multiple replacement classes provided via options', async () => {
    const editor = hook.editor();
    addSettings({
      templates: [{ title: 'a', description: 'b', content: '<div class="mceTmpl"><p class="cdate1">x</p><p class="mdate2">y</p></div>' }],
      template_cdate_classes: 'cdate1 cdate2',
      template_cdate_format: 'fake created date',
      template_mdate_classes: 'mdate1 mdate2',
      template_mdate_format: 'fake modified date',
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, [
      '<div class="mceTmpl">',
      '<p class="cdate1">fake created date</p>',
      '<p class="mdate2">fake modified date</p>',
      '</div>'
    ].join('\n'));
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 'fake modified date'.length);
    editor.insertContent('<p class="mdate1">inserted modified date</p>');
    addSettings({ template_mdate_format: 'changed modified date' });
    TinyAssertions.assertContent(editor, [
      '<div class="mceTmpl">',
      '<p class="cdate1">fake created date</p>',
      '<p class="mdate2">changed modified date</p>',
      '<p class="mdate1">changed modified date</p>',
      '</div>'
    ].join('\n'));
  });

  it('TINY-7433: replacement classes with regex like names', async () => {
    const editor = hook.editor();
    addSettings({
      templates: [{ title: 'a', description: 'b', content: '<div class="mceTmpl"><p class="custom+cdate">x</p><p class="custom+mdate">y</p></div>' }],
      template_cdate_classes: 'custom+cdate',
      template_cdate_format: 'fake created date',
      template_mdate_classes: 'custom+mdate',
      template_mdate_format: 'fake modified date',
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, [
      '<div class="mceTmpl">',
      '<p class="custom+cdate">fake created date</p>',
      '<p class="custom+mdate">fake modified date</p>',
      '</div>'
    ].join('\n'));
  });
});
