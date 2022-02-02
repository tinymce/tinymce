import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.selection.DetailsElementTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('Should should retain open attribute if it is not opened', () => {
    const editor = hook.editor();
    editor.setContent('<details><summary>a</summary>b</details>');
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('details', {
            attrs: {
              'open': str.is('open'),
              'data-mce-open': str.none('Should not have a data attr')
            },
            children: [
              s.element('summary', {
                children: [
                  s.text(str.is('a'))
                ]
              }),
              s.text(str.is('b'))
            ]
          })
        ]
      }))
    );
    TinyAssertions.assertContent(editor, '<details><summary>a</summary>b</details>');
  });

  it('Should should retain open attribute if it opened', () => {
    const editor = hook.editor();
    editor.setContent('<details open="open"><summary>a</summary>b</details>');
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => s.element('body', {
        children: [
          s.element('details', {
            attrs: {
              'open': str.is('open'),
              'data-mce-open': str.is('open')
            },
            children: [
              s.element('summary', {
                children: [
                  s.text(str.is('a'))
                ]
              }),
              s.text(str.is('b'))
            ]
          })
        ]
      }))
    );
    TinyAssertions.assertContent(editor, '<details open="open"><summary>a</summary>b</details>');
  });
});
