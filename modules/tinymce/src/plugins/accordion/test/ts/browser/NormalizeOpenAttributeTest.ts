import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyAssertions } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

describe('browser.tinymce.plugins.accordion.NormalizeOpenAttributeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce'
    },
    [ Plugin ]
  );

  it('TINY-12862: should normalize boolean open attribute to open="open"', () => {
    const editor = hook.editor();
    editor.setContent('<details open><summary>Test summary</summary><p>Test body</p></details>');
    TinyAssertions.assertContent(editor, [ '<details open="open">', '<summary>Test summary</summary>', '<p>Test body</p>', '</details>' ].join('\n'));
  });

  it('TINY-12862: should normalize open="foo" to open="open"', () => {
    const editor = hook.editor();
    editor.setContent('<details open="foo"><summary>Test summary</summary><p>Test body</p></details>');
    TinyAssertions.assertContent(editor, [ '<details open="open">', '<summary>Test summary</summary>', '<p>Test body</p>', '</details>' ].join('\n'));
  });

  it('TINY-12862: should normalize open="false" to open="open"', () => {
    const editor = hook.editor();
    editor.setContent('<details open="false"><summary>Test summary</summary><p>Test body</p></details>');
    TinyAssertions.assertContent(editor, [ '<details open="open">', '<summary>Test summary</summary>', '<p>Test body</p>', '</details>' ].join('\n'));
  });

  it('TINY-12862: should not normalize different tags than details', () => {
    const editor = hook.editor();
    editor.setContent('<div><dialog open="foo"><p>content</p></dialog></div>');
    TinyAssertions.assertContent(editor, [ '<div><dialog open="foo">', '<p>content</p>', '</dialog></div>' ].join('\n'));
  });
});
