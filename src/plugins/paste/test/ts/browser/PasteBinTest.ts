import { Assertions, Chain, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Id, Merger, Obj } from '@ephox/katamari';

import EditorManager from 'tinymce/core/api/EditorManager';
import { PasteBin, getPasteBinParent } from 'tinymce/plugins/paste/core/PasteBin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import ViewBlock from '../module/test/ViewBlock';

UnitTest.asynctest('tinymce.plugins.paste.browser.PasteBin', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();
  PastePlugin();

  const cases = [
    {
      label: 'TINY-1162: testing nested paste bins',
      content: '<div id="mcepastebin" contenteditable="true" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0"><div id="mcepastebin" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0">a</div><div id="mcepastebin" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0">b</div></div>',
      result: '<div>a</div><div>b</div>'
    },
    {
      label: 'TINY-1162: testing adjacent paste bins',
      content: '<div id="mcepastebin" contenteditable="true" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0"><p>a</p><p>b</p></div><div id="mcepastebin" contenteditable="true" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0"><p>c</p></div>',
      result: '<p>a</p><p>b</p><p>c</p>'
    }
  ];

  const viewBlock = ViewBlock();

  const cCreateEditorFromSettings = function (settings?, html?) {
    return Chain.async(function (viewBlock: any, next, die) {
      const randomId = Id.generate('tiny');
      html = html || '<textarea></textarea>';

      viewBlock.update(html);
      viewBlock.get().firstChild.id = randomId;

      EditorManager.init(Merger.merge(settings || {}, {
        selector: '#' + randomId,
        add_unload_trigger: false,
        indent: false,
        plugins: 'paste',
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

  const cCreateEditorFromHtml = function (html, settings) {
    return cCreateEditorFromSettings(settings, html);
  };

  const cRemoveEditor = function () {
    return Chain.op(function (editor: any) {
      editor.remove();
    });
  };

  const cAssertCases = function (cases) {
    return Chain.op(function (editor: any) {
      const pasteBin = PasteBin(editor);
      Obj.each(cases, function (c, i) {
        getPasteBinParent(editor).appendChild(editor.dom.createFragment(c.content));
        Assertions.assertEq(c.label || 'Asserting paste bin case ' + i, c.result, pasteBin.getHtml());
        pasteBin.remove();
      });
    });
  };

  viewBlock.attach();

  Pipeline.async({}, [
    Chain.asStep(viewBlock, [
      cCreateEditorFromSettings(),
      cAssertCases(cases),
      cRemoveEditor()
    ]),

    // TINY-1208/TINY-1209: same cases, but for inline editor
    Chain.asStep(viewBlock, [
      cCreateEditorFromHtml('<div>some text</div>', { inline: true }),
      cAssertCases(cases),
      cRemoveEditor()
    ])
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
