import { Id } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Assertions } from '@ephox/agar';
import Theme from 'tinymce/themes/modern/Theme';
import { Pipeline } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Element } from '@ephox/sugar';
import { Width } from '@ephox/sugar';
import { Height } from '@ephox/sugar';
import EditorManager from 'tinymce/core/EditorManager';
import ViewBlock from '../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('tinymce.themes.modern.test.browser.DimensionsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var viewBlock = new ViewBlock();

  var cCreateEditorFromSettings = function (settings, html?) {
    return Chain.on(function (viewBlock, next, die) {
      var randomId = Id.generate('tiny-');
      html = html || '<textarea></textarea>';

      viewBlock.update(html);
      viewBlock.get().firstChild.id = randomId;

      EditorManager.init(Merger.merge(settings, {
        selector: '#' + randomId,
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        setup: function (editor) {
          editor.on('SkinLoaded', function () {
            setTimeout(function () {
              next(Chain.wrap(editor));
            }, 0);
          });
        }
      }));
    });
  };

  var cCreateEditorFromHtml = function (html) {
    return cCreateEditorFromSettings({}, html);
  };

  var cRemoveEditor = function () {
    return Chain.op(function (editor) {
      editor.remove();
    });
  };

  var cAssertEditorDimension = function (dimension, value) {
    return Chain.on(function (editor, next, die) {
      var container = editor.iframeElement;
      var getter = dimension === 'width' ? Width.get : Height.get;
      var actualValue = typeof value === 'string' ? container.style[dimension] : getter(Element.fromDom(container));

      Assertions.assertEq("Editors content area has expected " + dimension, value, actualValue);

      next(Chain.wrap(editor));
    });
  };

  var cAssertEditorWidth = function (width) {
    return cAssertEditorDimension('width', width);
  };

  var cAssertEditorHeight = function (height) {
    return cAssertEditorDimension('height', height);
  };

  var cAssertEditorSize = function (width, height) {
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

