import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import AstNode from 'tinymce/core/api/html/Node';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';
import * as EditorContent from 'tinymce/core/content/EditorContent';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.content.EditorContentTest', (success, failure) => {
  const getFontTree = () => {
    const body = new AstNode('body', 1);
    const font = new AstNode('font', 1);
    const text = new AstNode('#text', 3);

    text.value = 'x';
    font.attr('size', '7');
    font.append(text);
    body.append(font);

    return body;
  };

  Theme();

  const toHtml = (node: AstNode) => {
    const htmlSerializer = HtmlSerializer({});
    return htmlSerializer.serialize(node);
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'getContent html', [
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(() => {
          const html = <string> EditorContent.getContent(editor);
          Assertions.assertHtml('Should be expected html', '<p>html</p>', html);
        })
      ]),
      Log.stepsAsStep('TINY-6281', 'getContent html with empty editor', [
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const html = <string> EditorContent.getContent(editor);
          Assertions.assertHtml('Should be expected html', '', html);
        })
      ]),
      Log.stepsAsStep('TINY-6281', 'getContent text', [
        tinyApis.sSetContent('<p>Text to be retrieved</p>'),
        Step.sync(() => {
          const text = <string> EditorContent.getContent(editor, { format: 'text' });
          Assertions.assertHtml('Should be expected text', 'Text to be retrieved', text);
        })
      ]),
      Log.stepsAsStep('TINY-6281', 'getContent text with empty editor', [
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const text = <string> EditorContent.getContent(editor, { format: 'text' });
          Assertions.assertHtml('Should be expected text', '', text);
        })
      ]),
      Log.stepsAsStep('TBA', 'getContent tree', [
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));
        })
      ]),
      Log.stepsAsStep('TINY-6281', 'getContent tree with empty editor', [
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree html', '', toHtml(tree));
        })
      ]),
      Log.stepsAsStep('TBA', 'getContent tree filtered', [
        Step.sync(() => {
          EditorContent.setContent(editor, '<p><font size="7">x</font></p>', { format: 'raw' });
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree filtered html', '<p><span style="font-size: 300%;">x</span></p>', toHtml(tree));
        })
      ]),
      Log.stepsAsStep('TBA', 'getContent tree using public api', [
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(() => {
          const tree = editor.getContent({ format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected filtered html', '<p>html</p>', toHtml(tree));
        })
      ]),
      Log.stepsAsStep('TBA', 'setContent html', [
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(function () {
          EditorContent.setContent(editor, '<p>new html</p>');
        }),
        tinyApis.sAssertContent('<p>new html</p>')
      ]),
      Log.stepsAsStep('TBA', 'setContent tree', [
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));

          EditorContent.setContent(editor, '<p>new html</p>');
          Assertions.assertHtml('Should be expected html', '<p>new html</p>', <string> EditorContent.getContent(editor));

          EditorContent.setContent(editor, tree);
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', <string> EditorContent.getContent(editor));
        })
      ]),
      Log.stepsAsStep('TBA', 'setContent tree filtered', [
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          EditorContent.setContent(editor, getFontTree());
          Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', <string> EditorContent.getContent(editor));
        })
      ]),
      Log.stepsAsStep('TBA', 'setContent tree using public api', [
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          editor.setContent(getFontTree());
          Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', <string> EditorContent.getContent(editor));
        })
      ])
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    inline: true
  }, success, failure);
});
