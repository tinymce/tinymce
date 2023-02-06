import { UiFinder } from '@ephox/agar';
import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/template/Plugin';

import { pInsertTemplate } from '../module/InsertTemplate';
import { Settings } from '../module/Settings';

describe('browser.tinymce.plugins.template.TemplateSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'template',
    toolbar: 'template',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const { addSettings, cleanupSettings } = Settings(hook);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  afterEach(() => {
    cleanupSettings();
  });

  const waitUntilIframeLoaded = async (dialogEl: SugarElement<Node>): Promise<void> => {
    await UiFinder.pWaitForState<HTMLIFrameElement>('iframe is loaded', dialogEl, 'iframe', (elm) => {
      const iframeDoc = elm.dom.contentDocument || elm.dom.contentWindow?.document;
      return Type.isNonNullable(iframeDoc?.body.firstChild);
    });
  };

  const assertPreviewContent = async (dialogEl: SugarElement<Node>, contentSelector: string): Promise<void> => {
    await waitUntilIframeLoaded(dialogEl);
    UiFinder.findIn<HTMLIFrameElement>(dialogEl, 'iframe').fold(
      () => assert.fail('Preview iframe not found'),
      (iframe) => {
        const iframeDoc = iframe.dom.contentDocument || iframe.dom.contentWindow?.document;
        const iframeBody = iframeDoc?.body;
        UiFinder.exists(SugarElement.fromDom(iframeBody as Node), contentSelector);
      }
    );
  };

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
      await waitUntilIframeLoaded(dialogEl);
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

  it('TINY-7433: Replace template values with regex like keys', () => {
    const editor = hook.editor();
    addSettings({
      template_replace_values: { 'first+name': 'Tester', 'email': 'test@test.com' },
    });
    editor.execCommand('mceInsertTemplate', false, '<p>{$first+name}</p>');
    TinyAssertions.assertContent(editor, '<p>Tester</p>');
  });

  it('TINY-9244: Parsed html should be shown when previewing templates', async () => {
    const editor = hook.editor();
    const unparsedHtml = '<img src="error" onerror="console.log(`unparsed html`)">';
    const parsedHtml = '<p><img src="error"></p>';
    const parsedPreviewHtmlSelector = 'p > img[src="error"][data-mce-src="error"]';
    addSettings({
      templates: [{ title: 'a', description: 'b', content: unparsedHtml }],
    });
    await pInsertTemplate(editor, async (dialogEl) => {
      await assertPreviewContent(dialogEl, parsedPreviewHtmlSelector);
    });
    TinyAssertions.assertContent(editor, parsedHtml);
  });
});
