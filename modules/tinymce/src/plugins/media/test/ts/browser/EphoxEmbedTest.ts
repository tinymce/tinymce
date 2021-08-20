import { ApproxStructure, Assertions, StructAssert, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.core.EphoxEmbedTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    media_url_resolver: (data, resolve) => {
      resolve({
        html: '<video width="300" height="150" ' +
          'controls="controls">\n<source src="' + data.url + '" />\n</video>'
      });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  const ephoxEmbedStructure = ApproxStructure.build((s, str/* , arr*/) => {
    return s.element('div', {
      children: [
        s.element('iframe', {
          attrs: {
            src: str.is('about:blank')
          }
        })
      ],
      attrs: {
        'data-ephox-embed-iri': str.is('embed-iri'),
        'contenteditable': str.is('false')
      }
    });
  });

  const assertDivStructure = (editor: Editor, expected: StructAssert) => {
    const div = editor.dom.select('div')[0];
    const actual = div ? SugarElement.fromDom(div) : SugarElement.fromHtml('');
    Assertions.assertStructure('Should be the same structure', expected, actual);
  };

  it('TBA: Open dialog, assert embedded content, close dialog and assert div structure', async () => {
    const editor = hook.editor();
    const content = '<div contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>';
    editor.setContent(content);
    assertDivStructure(editor, ephoxEmbedStructure);
    TinySelections.select(editor, 'div', []);
    await Utils.pOpenDialog(editor);
    await Utils.pAssertSourceValue(editor, 'embed-iri');
    await Utils.pAssertEmbedData(editor, content);
    TinyUiActions.submitDialog(editor);
    await Waiter.pTryUntil('wait for div structure', () => assertDivStructure(editor, ephoxEmbedStructure));
  });
});
