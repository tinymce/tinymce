import { Assertions, Chain, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Id, Merger } from '@ephox/katamari';
import { Element, Height, Width } from '@ephox/sugar';

import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/modern/Theme';

import ViewBlock from '../module/test/ViewBlock';

UnitTest.asynctest('tinymce.themes.modern.test.browser.DimensionsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const viewBlock = ViewBlock();

  const cCreateEditorFromSettings = function (settings, html?) {
    return Chain.async(function (viewBlock: any, next, die) {
      const randomId = Id.generate('tiny-');
      html = html || '<textarea></textarea>';

      viewBlock.update(html);
      viewBlock.get().firstChild.id = randomId;

      EditorManager.init(Merger.merge(settings, {
        selector: '#' + randomId,
        skin_url: '/project/js/tinymce/skins/lightgray',
        setup (editor) {
          editor.on('SkinLoaded', function () {
            setTimeout(function () {
              next(editor);
            }, 0);
          });
        }
      }));
    });
  };

  const cCreateEditorFromHtml = function (html) {
    return cCreateEditorFromSettings({}, html);
  };

  const cRemoveEditor = function () {
    return Chain.op(function (editor: any) {
      editor.remove();
    });
  };

  const cAssertEditorDimension = function (dimension, value) {
    return Chain.async(function (editor: any, next, die) {
      const container = editor.iframeElement;
      const getter = dimension === 'width' ? Width.get : Height.get;
      const actualValue = typeof value === 'string' ? container.style[dimension] : getter(Element.fromDom(container));

      Assertions.assertEq('Editors content area has expected ' + dimension, value, actualValue);

      next(editor);
    });
  };

  const cAssertEditorWidth = function (width) {
    return cAssertEditorDimension('width', width);
  };

  const cAssertEditorHeight = function (height) {
    return cAssertEditorDimension('height', height);
  };

  const cAssertEditorSize = function (width, height) {
    return Chain.fromChains([
      cAssertEditorWidth(width),
      cAssertEditorHeight(height)
    ]);
  };

  Theme();

  viewBlock.attach();

  Pipeline.async({}, [
    Chain.asStep(viewBlock, [
      cCreateEditorFromSettings({ width: 400, height: 300 }),
      cAssertEditorSize(400, 300),
      cRemoveEditor()
    ]),
    Chain.asStep(viewBlock, [
      cCreateEditorFromHtml('<textarea style="width: 300px"></textarea>'),
      cAssertEditorWidth(300),
      cRemoveEditor()
    ]),
    Chain.asStep(viewBlock, [
      cCreateEditorFromHtml('<textarea style="width: 350px; height: 200px"></textarea>'),
      cAssertEditorSize(350, 200),
      cRemoveEditor()
    ]),
    Chain.asStep(viewBlock, [
      cCreateEditorFromHtml('<textarea></textarea>'),
      cAssertEditorSize('100%', 100),
      cRemoveEditor()
    ])
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
