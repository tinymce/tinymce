asynctest(
  'browser.tinymce.plugins.table.ColorPickerTest',
  [
    'ephox.katamari.api.Merger',
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Assertions',
    'ephox.mcagar.api.Editor',
    'ephox.mcagar.api.ApiChains',
    'ephox.mcagar.api.UiChains',
    'ephox.mcagar.api.TinyDom',
    'tinymce.plugins.table.Plugin',
    'tinymce.plugins.colorpicker.Plugin',
    'tinymce.themes.modern.Theme',
    'global!document'
  ],
  function (Merger, Chain, NamedChain, UiFinder, Assertions, Editor, ApiChains, UiChains, TinyDom, TablePlugin, ColorPickerPlugin, Theme, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    TablePlugin();
    ColorPickerPlugin();
    Theme();

    var cTriggerTablePropertiesDialog = Chain.fromChains([
      ApiChains.cSetContent('<table><tr><td>X</td></tr></table>'),
      ApiChains.cSetCursor([0, 0, 0], 0),
      ApiChains.cExecCommand('mceTableProps'),
      UiChains.cWaitForPopup('looking for ColorPicker in color fields', '[role="dialog"][aria-label="Table properties"]')
    ]);

    var settings = {
      plugins: 'table colorpicker',
      indent: false,
      table_advtab: true,
      valid_styles: {
        '*': 'width,height,vertical-align,text-align,float,border-color,border-width,background-color,border,padding,border-spacing,border-collapse'
      },
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    };

    Chain.pipeline([
      Editor.cFromSettings(settings),
      cTriggerTablePropertiesDialog,
      Chain.op(function () {
        Assertions.assertPresence("Color picker exists in the DOM", { '.mce-colorbox i.mce-i-none': 2 }, TinyDom.fromDom(document.body));
      }),
      Editor.cRemove,

      Editor.cFromSettings(Merger.merge(settings, { plugins: 'table' })),
      cTriggerTablePropertiesDialog,
      Chain.op(function () {
        Assertions.assertPresence("Color picker doesn't exist in the DOM", { '.mce-colorbox i.mce-i-none': 0 }, TinyDom.fromDom(document.body));
      }),
      Editor.cRemove
    ], function () {
      success();
    }, failure);

  }
);
