import { ApproxStructure, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Document, DocumentFragment, Node } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Elements, Fragment } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { rangeInsertNode } from 'tinymce/core/selection/RangeInsertNode';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.selection.RangeInsertNode', (success, failure) => {
  Theme();

  const sRangeInsertNode = (editor: Editor, node: Node | DocumentFragment) => Step.sync(() => {
    rangeInsertNode(editor.dom, editor.selection.getRng(), node);
  });

  const fragmentFromHtml = (html: string, scope: Document): DocumentFragment => Fragment.fromElements(Elements.fromHtml(html, scope), scope).dom();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const doc = editor.getDoc();

    Pipeline.async({}, [
      Logger.t('Insert node at start of text', GeneralSteps.sequence([
        tinyApis.sFocus(),
        tinyApis.sSetRawContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sRangeInsertNode(editor, doc.createTextNode('X')),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('X')),
                  s.text(str.is('a'))
                ]
              })
            ]
          }))
        )
      ])),
      Logger.t('Insert node at end of text', GeneralSteps.sequence([
        tinyApis.sFocus(),
        tinyApis.sSetRawContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        sRangeInsertNode(editor, doc.createTextNode('X')),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('a')),
                  s.text(str.is('X'))
                ]
              })
            ]
          }))
        )
      ])),
      Logger.t('Insert document fragment at start of text', GeneralSteps.sequence([
        tinyApis.sFocus(),
        tinyApis.sSetRawContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sRangeInsertNode(editor, fragmentFromHtml('X', doc)),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('X')),
                  s.text(str.is('a'))
                ]
              })
            ]
          }))
        )
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
