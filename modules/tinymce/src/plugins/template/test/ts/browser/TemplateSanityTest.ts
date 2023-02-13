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

  it('TINY-9244: Sanitized html should be shown when previewing template', async () => {
    const editor = hook.editor();
    const unsanitizedHtml = '<img src="error" onerror="throw new Error();">';
    addSettings({
      templates: [{ title: 'a', description: 'b', content: unsanitizedHtml }],
    });
    const unsanitizedPreviewHtmlSelector = 'p > img[src="error"][onerror="throw new Error();"]';
    const sanitizedPreviewHtmlSelector = 'p > img[src="error"][data-mce-src="error"]';
    const assertPreviewContent = (dialogEl: SugarElement<Node>, existsSelector: string, notExistsSelector: string): void => {
      UiFinder.findIn<HTMLIFrameElement>(dialogEl, 'iframe').fold(
        () => assert.fail('Preview iframe not found'),
        (iframe) => {
          // fallback for pre-IE 8 using contentWindow.document
          const iframeDoc = iframe.dom.contentDocument || iframe.dom.contentWindow?.document;
          const iframeBody = SugarElement.fromDom(iframeDoc?.body as Node);
          UiFinder.exists(iframeBody, existsSelector);
          UiFinder.notExists(iframeBody, notExistsSelector);
        }
      );
    };

    try {
      await pPreviewTemplate(editor, (dialogEl) => assertPreviewContent(dialogEl, sanitizedPreviewHtmlSelector, unsanitizedPreviewHtmlSelector));
    } catch {
      assert.fail('Unsanitized html read');
    }
  });

  const assertFnDoesNotReadUnsanitizedHtmlInDom = async (editor: Editor, fn: (unsanitizedHtml: string) => void | Promise<void>): Promise<void> => {
    const fnReadsUnsanitizedHtmlInDom = async () => {
      const unsanitizedHtml = '<img src="error" onerror="window.document.unsanitizedHtmlFn();">';
      let isUnsanitizedHtmlRead = false;
      (editor.getDoc() as any).unsanitizedHtmlFn = () => {
        isUnsanitizedHtmlRead = true;
      };
      await fn(unsanitizedHtml);
      // wait for any unsanitized html to be read and error to be thrown if it is
      await Waiter.pWait(1);
      return isUnsanitizedHtmlRead;
    };
    assert.isFalse(await fnReadsUnsanitizedHtmlInDom(), 'Unsanitized html read');
  };

  it('TINY-9244: Unsanitized html should not be read when inserting template via command', async () => {
    const editor = hook.editor();
    await assertFnDoesNotReadUnsanitizedHtmlInDom(editor, (unsanitizedHtml) => {
      editor.execCommand('mceInsertTemplate', false, unsanitizedHtml);
    });
  });

  it('TINY-9244: Unsanitized html should not be read when inserting template via dialog', async () => {
    const editor = hook.editor();
    const unsanitizedHtml = '<img src="error" onerror="window.document.unsanitizedHtmlFn();">';
    addSettings({
      templates: [{ title: 'a', description: 'b', content: unsanitizedHtml }],
    });
    await assertFnDoesNotReadUnsanitizedHtmlInDom(editor, async () => {
      await pInsertTemplate(editor);
    });
  });
});
