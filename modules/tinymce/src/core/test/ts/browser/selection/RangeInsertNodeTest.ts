import { GeneralSteps, Logger, Pipeline, Step, ApproxStructure } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';
import { rangeInsertNode } from 'tinymce/core/selection/RangeInsertNode';
import { Node, DocumentFragment, Document } from '@ephox/dom-globals';
import { Fragment, Elements } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.core.selection.RangeInsertNode', (success, failure) => {
  Theme();

  const sRangeInsertNode = (editor: Editor, node: Node | DocumentFragment) => {
    return Step.sync(() => {
      rangeInsertNode(editor.dom, editor.selection.getRng(), node);
    });
  };

  const fragmentFromHtml = (html: string, scope: Document): DocumentFragment => {
    return Fragment.fromElements(Elements.fromHtml(html, scope), scope).dom();
  };

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const doc = editor.getDoc();

    Pipeline.async({}, [
      Logger.t('Insert node at start of text', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetRawContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 0),
        sRangeInsertNode(editor, doc.createTextNode('X')),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('X')),
                    s.text(str.is('a'))
                  ]
                })
              ]
            });
          })
        )
      ])),
      Logger.t('Insert node at end of text', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetRawContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        sRangeInsertNode(editor, doc.createTextNode('X')),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a')),
                    s.text(str.is('X'))
                  ]
                })
              ]
            });
          })
        )
      ])),
      Logger.t('Insert document fragment at start of text', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetRawContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 0),
        sRangeInsertNode(editor, fragmentFromHtml('X', doc)),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('X')),
                    s.text(str.is('a'))
                  ]
                })
              ]
            });
          })
        )
      ])),
    ], onSuccess, onFailure);
  }, {
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
