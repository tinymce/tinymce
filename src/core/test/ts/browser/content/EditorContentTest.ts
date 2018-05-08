import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import * as EditorContent from 'tinymce/core/content/EditorContent';
import Assertions from '@ephox/agar/lib/main/ts/ephox/agar/api/Assertions';
import Serializer from 'tinymce/core/api/html/Serializer';
import Node from 'tinymce/core/api/html/Node';

UnitTest.asynctest('browser.tinymce.core.content.EditorGetContentTreeTest', (success, failure) => {
  const getFontTree = () => {
    const body = new Node('body', 1);
    const font = new Node('font', 1);
    const text = new Node('#text', 3);

    text.value = 'x';
    font.attr('size', '7');
    font.append(text);
    body.append(font);

    return body;
  };

  Theme();

  const toHtml = (node: Node) => {
    const htmlSerializer = Serializer({});
    return htmlSerializer.serialize(node);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('getContent html', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(() => {
          const html = EditorContent.getContent(editor);
          Assertions.assertHtml('Should be expected html', '<p>html</p>', html);
        })
      ])),
      Logger.t('getContent tree', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as Node;
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));
        })
      ])),
      Logger.t('getContent tree filtered', GeneralSteps.sequence([
        Step.sync(() => {
          EditorContent.setContent(editor, '<p><font size="7">x</font></p>', { format: 'raw' });
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as Node;
          Assertions.assertHtml('Should be expected tree filtered html', '<p><span style="font-size: 300%;">x</span></p>', toHtml(tree));
        })
      ])),
      Logger.t('getContent tree using public api', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(() => {
          const tree = editor.getContent({ format: 'tree'}) as Node;
          Assertions.assertHtml('Should be expected filtered html', '<p>html</p>', toHtml(tree));
        })
      ])),
      Logger.t('setContent html', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(function () {
          EditorContent.setContent(editor, '<p>new html</p>');
        }),
        tinyApis.sAssertContent('<p>new html</p>')
      ])),
      Logger.t('setContent tree', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as Node;
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));

          EditorContent.setContent(editor, '<p>new html</p>');
          Assertions.assertHtml('Should be expected html', '<p>new html</p>', EditorContent.getContent(editor));

          EditorContent.setContent(editor, tree);
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', EditorContent.getContent(editor));
        })
      ])),
      Logger.t('setContent tree filtered', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          EditorContent.setContent(editor, getFontTree());
          Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', EditorContent.getContent(editor));
        })
      ])),
      Logger.t('setContent tree using public api', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          editor.setContent(getFontTree());
          Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', EditorContent.getContent(editor));
        })
      ])),
      Logger.t('getContent empty editor depending on forced_root_block setting', GeneralSteps.sequence([
        tinyApis.sSetSetting('forced_root_block', 'div'),
        tinyApis.sSetRawContent('<p><br></p>'),
        tinyApis.sAssertContent('<p>&nbsp;</p>'),
        tinyApis.sSetRawContent('<div><br></div>'),
        tinyApis.sAssertContent(''),
        tinyApis.sSetSetting('forced_root_block', 'p')
      ]))
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
    inline: true
  }, success, failure);
});
