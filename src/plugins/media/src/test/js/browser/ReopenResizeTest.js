asynctest(
  'browser.tinymce.plugins.media.ReopenResizeTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.media.Plugin',
    'tinymce.plugins.media.test.Utils',
    'tinymce.themes.modern.Theme'
  ],
  function (
    ApproxStructure, FocusTools, Pipeline, RawAssertions, Step, UiFinder, Waiter, TinyApis,
    TinyDom, TinyLoader, TinyUi, Plugin, Utils, Theme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Plugin();
    Theme();

    var videoWithWidth = function (width) {
      return ApproxStructure.build(function (s, str) {
        return s.element('body', {
          children: [
            s.element('img', {
              attrs: {
                width: str.is(width)
              }
            }),
            s.anything(),
            s.anything(),
            s.anything(),
            s.anything()
          ]
        });
      });
    };

    var sWaitForResizeHandles = function (editor) {
      return Waiter.sTryUntil('Wait for new width value', Step.sync(function () {
        RawAssertions.assertEq('Resize handle should exist', editor.dom.select('#mceResizeHandlenw').length, 1);
      }), 1, 3000);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var ui = TinyUi(editor);
      var apis = TinyApis(editor);

      Pipeline.async({}, [
        Utils.sOpenDialog(ui),
        Utils.sPasteSourceValue(ui, 'a'),
        Utils.sAssertWidthValue(ui, '300'),
        ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
        sWaitForResizeHandles(editor),
        Utils.sOpenDialog(ui),
        Utils.sChangeWidthValue(ui, '500'),
        ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
        sWaitForResizeHandles(editor),
        apis.sAssertContentStructure(videoWithWidth('500'))
      ], onSuccess, onFailure);
    }, {
      plugins: ["media"],
      toolbar: "media",
      forced_root_block: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
