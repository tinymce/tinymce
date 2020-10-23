import { ApproxStructure, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import * as InsertBr from 'tinymce/core/newline/InsertBr';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.newline.InsertBrTest', function (success, failure) {

  Theme();

  const sInsertBr = function (editor) {
    return Step.sync(function () {
      InsertBr.insert(editor);
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Enter inside inline boundary link', GeneralSteps.sequence([
        Logger.t('Insert br at beginning of inline boundary link', GeneralSteps.sequence([
          tinyApis.sFocus(),
          tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 0),
          tinyApis.sNodeChanged(),
          sInsertBr(editor),
          tinyApis.sAssertSelection([ 0, 2, 0 ], 1, [ 0, 2, 0 ], 1),
          tinyApis.sAssertContent('<p>a<br /><a href="#">b</a>c</p>')
        ])),
        Logger.t('Insert br in middle inline boundary link', GeneralSteps.sequence([
          tinyApis.sFocus(),
          tinyApis.sSetContent('<p>a<a href="#">bc</a>d</p>'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 1),
          tinyApis.sNodeChanged(),
          sInsertBr(editor),
          tinyApis.sAssertSelection([ 0, 1 ], 2, [ 0, 1 ], 2),
          tinyApis.sAssertContent('<p>a<a href="#">b<br />c</a>d</p>')
        ])),
        Logger.t('Insert br at end of inline boundary link', GeneralSteps.sequence([
          tinyApis.sFocus(),
          tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 1),
          tinyApis.sNodeChanged(),
          sInsertBr(editor),
          tinyApis.sAssertSelection([ 0 ], 3, [ 0 ], 3),
          tinyApis.sAssertContent('<p>a<a href="#">b</a><br /><br />c</p>')
        ])),
        Logger.t('Insert br at end of inline boundary link with trailing br', GeneralSteps.sequence([
          tinyApis.sFocus(),
          tinyApis.sSetRawContent('<p>a<a href="#">b</a><br /></p>'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 1),
          tinyApis.sNodeChanged(),
          sInsertBr(editor),
          tinyApis.sAssertSelection([ 0 ], 3, [ 0 ], 3),
          tinyApis.sAssertContent('<p>a<a href="#">b</a><br /><br /></p>')
        ]))
      ])),
      Logger.t('Enter inside inline boundary code', GeneralSteps.sequence([
        Logger.t('Insert br at beginning of boundary code', GeneralSteps.sequence([
          tinyApis.sFocus(),
          tinyApis.sSetContent('<p>a<code>b</code>c</p>'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 0),
          tinyApis.sNodeChanged(),
          sInsertBr(editor),
          tinyApis.sAssertSelection([ 0, 1 ], 2, [ 0, 1 ], 2),
          tinyApis.sAssertContent('<p>a<code><br />b</code>c</p>')
        ])),
        Logger.t('Insert br at middle of boundary code', GeneralSteps.sequence([
          tinyApis.sFocus(),
          tinyApis.sSetContent('<p>a<code>bc</code>d</p>'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 1),
          tinyApis.sNodeChanged(),
          sInsertBr(editor),
          tinyApis.sAssertSelection([ 0, 1 ], 2, [ 0, 1 ], 2),
          tinyApis.sAssertContent('<p>a<code>b<br />c</code>d</p>')
        ])),
        Logger.t('Insert br at end of boundary code', GeneralSteps.sequence([
          tinyApis.sFocus(),
          tinyApis.sSetContent('<p>a<code>b</code>c</p>'),
          tinyApis.sSetCursor([ 0, 1, 0 ], 1),
          tinyApis.sNodeChanged(),
          sInsertBr(editor),
          tinyApis.sAssertSelection([ 0, 1, 2 ], 0, [ 0, 1, 2 ], 0),
          tinyApis.sAssertContent('<p>a<code>b<br /></code>c</p>')
        ]))
      ])),
      Logger.t('Insert br after text', GeneralSteps.sequence([
        tinyApis.sFocus(),
        tinyApis.sSetRawContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 1),
        tinyApis.sNodeChanged(),
        sInsertBr(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('a')),
                  s.element('br', {}),
                  s.element('br', {})
                ]
              })
            ]
          }))
        ),
        tinyApis.sAssertSelection([ 0 ], 2, [ 0 ], 2)
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
