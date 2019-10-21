import { Chain, Guard, Log, Mouse, NamedChain, Pipeline, Step, TestLogs, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Editor } from '@ephox/mcagar';
import { Attr, Body, Element, Html, Insert, Remove } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import EditorManager from 'tinymce/core/api/EditorManager';
import Delay from 'tinymce/core/api/util/Delay';

UnitTest.asynctest('browser.tinymce.plugins.table.InlineEditorInsideTableTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const containerHtml = '<table>' +
  '<tbody>' +
  '<tr>' +
  '<td>' +
  '<div class="tinymce" style="border: 1px gray solid">a</div>' +
  '</td>' +
  '</tr>' +
  '</tbody>' +
  '</table>';

  const cOnSelector = function (selector: string) {
    return Chain.control(
      Chain.async(function (_, next) {
        EditorManager.init({
          selector,
          inline: true,
          theme: 'silver',
          statusbar: false,
          menubar: false,
          plugins: 'table',
          skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
          content_css: '/project/tinymce/js/tinymce/skins/content/default',
          setup (editor) {
            editor.on('SkinLoaded', function () {
                Delay.setTimeout(function () {
                    next(editor);
                }, 0);
            });
        }
        });
      }),
      Guard.addLogging('Add editor settings')
    );
  };

  const cNotExists = (container: Element, selector: string) => {
    return Chain.control(
      Chain.op(() => {
        UiFinder.findIn(container, selector).fold(
          () => Assert.eq('should not find anything', true, true),
          () => Assert.eq('Expected ' + selector + ' not to exist.', true, false)
        );
      }),
      Guard.addLogging('Assert ' + selector + ' does not exist')
    );
  };

  const step = Step.raw((_, next, die, initLogs) => {
    NamedChain.pipeline([
      NamedChain.write('container', Chain.async((input, n, die) => {
        const container = Element.fromTag('div');
        Attr.set(container, 'id', 'test-container-div');
        Html.set(container, containerHtml);
        Insert.append(Body.body(), container);
        n(container);
      })),
      NamedChain.write('editor', cOnSelector('div.tinymce')),
      NamedChain.direct('container', Chain.fromChains([
        UiFinder.cFindIn('div.tinymce'),
        Mouse.cMouseOver,
        cNotExists(Body.body(), 'div[data-row="0"]')
      ]), '_'),
      NamedChain.read('editor', Editor.cRemove),
      NamedChain.read('container', Chain.op((div) => Remove.remove(div)))
    ], next, die, initLogs);
  });

  Pipeline.async({}, [
    Log.step('TBA', 'Table: Table outside of inline editor should not become resizable', step)
  ], () => success(), failure, TestLogs.init());
  });
