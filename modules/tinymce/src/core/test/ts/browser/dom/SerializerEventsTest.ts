import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.dom.SerializerEventsTest', function (success, failure) {

  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Logger.t('Pre/post process events', Step.sync(function () {
        let preProcessArgs, postProcessArgs;

        editor.on('PreProcess', function (o) {
          preProcessArgs = o;
          editor.dom.setAttrib(preProcessArgs.node.getElementsByTagName('span')[0], 'class', 'abc');
        });

        editor.on('PostProcess', function (o) {
          o.content = o.content.replace(/<em>/g, '<em class="123">');
          postProcessArgs = o;
        });

        editor.setContent('<p><span id="test2"><em>abc</em></span>123<a href="file.html" data-mce-href="file.html">link</a>');
        Assertions.assertHtml(
          'Should be expected altered html',
          '<p><span id="test2" class="abc"><em class="123">abc</em></span>123<a href="file.html">link</a></p>',
          editor.serializer.serialize(editor.getBody(), { test : 'abc', getInner: true })
        );

        Assertions.assertEq('Should be expected preprocess custom arg', 'abc', preProcessArgs.test);
        Assertions.assertEq('Should be expected preprocess format', 'html', preProcessArgs.format);
        Assertions.assertEq('Should be expected element child', 'P', preProcessArgs.node.firstChild.tagName);
        Assertions.assertEq('Should be expected postprocess custom arg', 'abc', postProcessArgs.test);
        Assertions.assertEq('Should be expected postprocess format', 'html', postProcessArgs.format);
        Assertions.assertEq(
          'Should be expected postprocess format',
          '<p><span id="test2" class="abc"><em class="123">abc</em></span>123<a href="file.html">link</a></p>',
          postProcessArgs.content
        );
      }))
    ], onSuccess, onFailure);
  }, {
    inline: true,
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
