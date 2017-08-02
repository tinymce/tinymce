asynctest(
  'tinymce.plugins.paste.browser.PasteBin', [
    'ephox.katamari.api.Obj',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'tinymce.themes.modern.Theme',
    'tinymce.plugins.paste.Plugin',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.paste.core.PasteBin'
  ],
  function (Obj, Assertions, Pipeline, Step, Theme, PastePlugin, TinyLoader, PasteBin) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();
    PastePlugin();

    var cases = [
      {
        label: "TINY-1162: testing nested paste bins",
        content: '<div id="mcepastebin" contenteditable="true" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0"><div id="mcepastebin" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0">a</div><div id="mcepastebin" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0">b</div></div>',
        result: '<div>a</div><div>b</div>'
      },
      {
        label: "TINY-1162: testing adjacent paste bins",
        content: '<div id="mcepastebin" contenteditable="true" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0"><p>a</p><p>b</p></div><div id="mcepastebin" contenteditable="true" data-mce-bogus="all" data-mce-style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0" style="position: absolute; top: 0.40000057220458984px;width: 10px; height: 10px; overflow: hidden; opacity: 0"><p>c</p></div>',
        result: '<p>a</p><p>b</p><p>c</p>'
      }
    ];


    var sAssertCases = function (editor, cases) {
      return Step.sync(function () {
        var pasteBin = new PasteBin(editor);
        Obj.each(cases, function (c, i) {
          editor.getBody().innerHTML = c.content;
          Assertions.assertEq(c.label || "Asserting paste bin case " + i, c.result, pasteBin.getHtml());
          pasteBin.remove();
        });
      });
    };


    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, [
        sAssertCases(editor, cases)
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      indent: false,
      plugins: 'paste',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);