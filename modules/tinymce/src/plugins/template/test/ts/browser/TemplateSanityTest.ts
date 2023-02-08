import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/template/Plugin';

import { pInsertTemplate, pPreviewTemplate } from '../module/InsertTemplate';
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
    await pInsertTemplate(editor, (dialogEl) => {
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
    const unparsedHtml = '<img src="error" onerror="throw new Error();">';
    addSettings({
      templates: [{ title: 'a', description: 'b', content: unparsedHtml }],
    });
    const unParsedPreviewHtmlSelector = 'p > img[src="error"][onerror="throw new Error();"]';
    const parsedPreviewHtmlSelector = 'p > img[src="error"][data-mce-src="error"]';
    const assertPreviewContent = (dialogEl: SugarElement<Node>, existsSelector: string, notExistsSelector: string): void => {
      UiFinder.findIn<HTMLIFrameElement>(dialogEl, 'iframe').fold(
        () => assert.fail('Preview iframe not found'),
        (iframe) => {
          const iframeDoc = iframe.dom.contentDocument || iframe.dom.contentWindow?.document;
          const iframeBody = SugarElement.fromDom(iframeDoc?.body as Node);
          UiFinder.exists(iframeBody, existsSelector);
          UiFinder.notExists(iframeBody, notExistsSelector);
        }
      );
    };

    try {
      await pPreviewTemplate(editor, (dialogEl) => assertPreviewContent(dialogEl, parsedPreviewHtmlSelector, unParsedPreviewHtmlSelector));
    } catch {
      assert.fail('Unparsed html interpreted');
    }
  });

  it('TINY-9244: Unsanitised html should not be read when inserting templates via command', async () => {
    const editor = hook.editor();
    const fnReadsUnsanitisedHtml = async (fn: (unsanitisedHtml: string) => any) => {
      const unsanitisedHtml = '<img src="error" onerror="window.document.unsanitisedHtmlFn();">';
      let isUnsanitisedHtmlRead = false;
      (editor.getDoc() as any).unsanitisedHtmlFn = () => {
        isUnsanitisedHtmlRead = true;
      };
      fn(unsanitisedHtml);
      // wait for unsanitised html to be read and error to be thrown
      await Waiter.pWait(1000);
      return isUnsanitisedHtmlRead;
    };
    assert.isFalse(await fnReadsUnsanitisedHtml((unsanitisedHtml) => {
      editor.execCommand('mceInsertTemplate', false, unsanitisedHtml);
    }), 'Unsanitised html read');
  });
});
