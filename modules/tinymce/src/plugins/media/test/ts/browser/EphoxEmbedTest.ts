import { ApproxStructure, Assertions, StructAssert, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';
import Plugin from 'tinymce/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.core.EphoxEmbedTest', () => {
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

  context('embed', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: [ 'media' ],
      toolbar: 'media',
      media_url_resolver: (data: { url: string }, resolve: (response: { html: string }) => void) => {
        resolve({
          html: '<video width="300" height="150" ' +
            'controls="controls">\n<source src="' + data.url + '" />\n</video>'
        });
      },
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ], true);

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

  context('youtube embed', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      plugins: [ 'media' ],
      toolbar: 'media',
      setup: (editor: Editor) => {
        editor.on('PreInit', () => {
          const converter = (nodes: AstNode[]): void => {
            Arr.each(nodes, (node) => {
              const shimNode = new AstNode('span', 1);
              shimNode.attr('class', 'mce-shim');

              node.append(shimNode);
              node.attr('contenteditable', 'false');
            });
          };

          editor.parser.addAttributeFilter('data-ephox-embed-iri', converter);
        });
      },
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ], true);

    const responsiveEmbedData =
      `<div style="max-width: 650px;" data-ephox-embed-iri="https://www.youtube.com/watch?v=5auGeCM0knQ">
      <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;"
      src="https://www.youtube.com/embed/5auGeCM0knQ?rel=0" scrolling="no" allow="accelerometer;
      clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
      allowfullscreen="allowfullscreen"></iframe></div></div>`;

    it('TINY-8714: Assert dimensions of responsive embed data', async () => {
      const editor = hook.editor();
      editor.setContent(responsiveEmbedData);
      TinySelections.select(editor, 'div', []);
      await Utils.pOpenDialog(editor);

      const aspectRatio = 9 / 16;
      const expectedWidth = 650;
      const expectedHeight = Math.ceil(expectedWidth * aspectRatio);

      await Utils.pAssertHeightAndWidth(editor, expectedHeight.toString(), expectedWidth.toString());
    });
  });
});
