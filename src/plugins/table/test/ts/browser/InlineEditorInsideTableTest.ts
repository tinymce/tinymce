import { Chain, Mouse, NamedChain, UiFinder, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';

import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { Insert, Body, Element, Html, Attr, Remove } from '@ephox/sugar';
import EditorManager from 'tinymce/core/api/EditorManager';
import { Editor } from '@ephox/mcagar';

UnitTest.asynctest('browser.tinymce.plugins.table.InlineEditorInsideTableTest', (success, failure) => {
  Plugin();
  Theme();

  const containerHtml = '<table>' +
  '<tbody>' +
  '<tr>' +
  '<td>' +
  '<div class="tinymce" style="border: 1px gray solid">a</div>' +
  '</td>' +
  '</tr>' +
  '</tbody>' +
  '</table>';

  const cOnSelector = function (selector) {
    return Chain.on(function (_, next) {
      EditorManager.init({
        selector,
        inline: true,
        statusbar: false,
        menubar: false,
        plugins: 'table',
        skin_url: '/project/js/tinymce/skins/lightgray',
        setup (editor) {
          editor.on('SkinLoaded', function () {
              setTimeout(function () {
                  next(Chain.wrap(editor));
              }, 0);
          });
      }
      });
    });
  };

  const cNotExists = (container, selector) => {
    return Chain.op(() => {
      UiFinder.findIn(container, selector).fold(
        () => RawAssertions.assertEq('should not find anything', true, true),
        () => RawAssertions.assertEq('Expected ' + selector + ' not to exist.', true, false)
      );
    });
  };

  NamedChain.pipeline([
    NamedChain.write('container', Chain.on((input, next) => {
      const container = Element.fromTag('div');
      Attr.set(container, 'id', 'test-container-div');
      Html.set(container, containerHtml);
      Insert.append(Body.body(), container);

      next(Chain.wrap(container));
    })),
    NamedChain.write('editor', cOnSelector('div.tinymce')),
    NamedChain.direct('container', Chain.fromChains([
      UiFinder.cFindIn('div.tinymce'),
      Mouse.cMouseOver,
      cNotExists(Body.body(), 'div[data-row="0"]')
    ]), false),
    NamedChain.read('editor', Editor.cRemove),
    NamedChain.read('container', Chain.op((div) => Remove.remove(div)))
  ], function () {
    success();
  }, failure);
});
