import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Node from 'tinymce/core/api/html/Node';
import Serializer from 'tinymce/core/api/html/Serializer';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.content.EditorGetContentTreeTest', (success, failure) => {
  Theme();

  const toHtml = function (node: Node) {
    const htmlSerializer = Serializer({});
    return htmlSerializer.serialize(node);
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Get content as tree', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        Step.sync(function () {
          const html = toHtml(editor.getContent({ format: 'tree' }));
          Assertions.assertHtml('Should be expected html', '<p>a</p>', html);
        })
      ])),
      Logger.t('Get selection as tree', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>ab<em>c</em></p>'),
        tinyApis.sSetSelection([ 0, 0 ], 1, [ 0, 1, 0 ], 1),
        Step.sync(function () {
          const html = toHtml(editor.selection.getContent({ format: 'tree' }));
          Assertions.assertHtml('Should be expected selection html', 'b<em>c</em>', html);
        })
      ])),
      Logger.t('Get selection as tree with whitespace', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a b c</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 1, [ 0, 0 ], 4),
        Step.sync(function () {
          const html = toHtml(editor.selection.getContent({ format: 'tree' }));
          Assertions.assertHtml('Should be expected selection html', ' b ', html);
        })
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    inline: true
  }, success, failure);
});
