import { Assertions, Chain, Pipeline, Log, Guard } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Merger, Obj } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';

import { PasteBin, getPasteBinParent } from 'tinymce/plugins/paste/core/PasteBin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.plugins.paste.browser.PasteBin', (success, failure) => {

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

  const cCreateEditorFromSettings = function (settings?, html?) {
    return Chain.control(
      McEditor.cFromHtml(html, Merger.merge(settings || {}, {
        add_unload_trigger: false,
        indent: false,
        plugins: 'paste',
        base_url: '/project/tinymce/js/tinymce'
      })),
      Guard.addLogging(`Create editor using settings ${settings}`)
    );
  };

  const cCreateEditorFromHtml = function (html, settings) {
    return Chain.control(
      cCreateEditorFromSettings(settings, html),
      Guard.addLogging(`Create editor using ${html}`)
    );
  };

  const cRemoveEditor = function () {
    return Chain.control(
      McEditor.cRemove,
      Guard.addLogging('Remove Editor')
    );
  };

  const cAssertCases = function (cases) {
    return Chain.control(
      Chain.op(function (editor: any) {
        const pasteBin = PasteBin(editor);
        Obj.each(cases, function (c, i) {
          getPasteBinParent(editor).appendChild(editor.dom.createFragment(c.content));
          Assertions.assertEq(c.label || 'Asserting paste bin case ' + i, c.result, pasteBin.getHtml());
          pasteBin.remove();
        });
      }),
      Guard.addLogging('Assert cases')
    );
  };

  Pipeline.async({}, [
    Chain.asStep({}, Log.chains('TBA', 'Paste: Create editor from settings and test nested and adjacent paste bins', [
      cCreateEditorFromSettings(),
      cAssertCases(cases),
      cRemoveEditor()
    ])),

    // TINY-1208/TINY-1209: same cases, but for inline editor
    Chain.asStep({}, Log.chains('TBA', 'Paste: Create editor from html and test nested and adjacent paste bins', [
      cCreateEditorFromHtml('<div>some text</div>', { inline: true }),
      cAssertCases(cases),
      cRemoveEditor()
    ]))
  ], function () {
    success();
  }, failure);
});
