import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
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

  context('Previewing unparsed content', () => {
    const unparsedHtml = '<img src="error" onerror="throw new Error();">';
    const unparsedPreviewHtmlSelector = 'p > img[src="error"][onerror="throw new Error();"]';
    const parsedPreviewHtmlSelector = 'p > img[src="error"][data-mce-src="error"]';

    const pPreviewAndAssertNoUnparsedContent = async (editor: Editor): Promise<void> => {
      const assertNoUnparsedContent = (dialogEl: SugarElement<Node>): void => {
        UiFinder.findIn<HTMLIFrameElement>(dialogEl, 'iframe').fold(
          () => assert.fail('Preview iframe not found'),
          (iframe) => {
            const iframeDoc = iframe.dom.contentDocument;
            const iframeBody = SugarElement.fromDom(iframeDoc?.body as Node);
            UiFinder.exists(iframeBody, parsedPreviewHtmlSelector);
            UiFinder.notExists(iframeBody, unparsedPreviewHtmlSelector);
          }
        );
      };

      try {
        await pPreviewTemplate(editor, assertNoUnparsedContent);
      } catch {
        assert.fail('Unparsed html read');
      }
    };

    it('TINY-9244: Parsed html should be shown when previewing template', async () => {
      const editor = hook.editor();
      addSettings({
        templates: [{ title: 'a', description: 'b', content: unparsedHtml }],
      });
      await pPreviewAndAssertNoUnparsedContent(editor);
    });

    it('TINY-9867: Parsed html should be shown when previewing template containing <html> tags', async () => {
      const editor = hook.editor();
      addSettings({
        templates: [{ title: 'a', description: 'b', content: `<html>${unparsedHtml}</html>` }],
      });
      await pPreviewAndAssertNoUnparsedContent(editor);
    });
  });

  context('Inserting unparsed content', () => {
    const unparsedHtml = '<img src="error" onerror="window.document.unparsedHtmlFn();">';
    const assertFnDoesNotReadUnParsedHtmlInDom = async (editor: Editor, fn: (unparsedHtml: string) => void | Promise<void>): Promise<void> => {
      const isUnParsedHtmlRead = Cell(false);
      (editor.getDoc() as any).unparsedHtmlFn = () => {
        isUnParsedHtmlRead.set(true);
      };
      await fn(unparsedHtml);
      // wait for any unparsed html to be read and error to be thrown if it is
      await Waiter.pWait(1);
      assert.isFalse(isUnParsedHtmlRead.get(), 'Unparsed html read');
      (editor.getDoc() as any).unparsedHtmlFn = null;
    };

    it('TINY-9244: Unparsed html should not be read when inserting template via command', async () => {
      const editor = hook.editor();
      await assertFnDoesNotReadUnParsedHtmlInDom(editor, (unparsedHtml) => {
        editor.execCommand('mceInsertTemplate', false, unparsedHtml);
      });
    });

    it('TINY-9244: Unparsed html should not be read when inserting template via dialog', async () => {
      const editor = hook.editor();
      addSettings({ templates: [{ title: 'a', description: 'b', content: unparsedHtml }] });
      await assertFnDoesNotReadUnParsedHtmlInDom(editor, async () => {
        await pInsertTemplate(editor);
      });
    });
  });
});
