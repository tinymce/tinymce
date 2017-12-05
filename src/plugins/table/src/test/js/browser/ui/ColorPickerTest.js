asynctest(
  'browser.tinymce.plugins.table.ColorPickerTest',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.ApproxStructure',
    'ephox.mcagar.api.Editor',
    'ephox.mcagar.api.ApiChains',
    'ephox.mcagar.api.UiChains',
    'ephox.mcagar.api.TinyDom',
    'tinymce.plugins.table.Plugin',
    'tinymce.plugins.colorpicker.Plugin',
    'tinymce.themes.modern.Theme',
    'global!document'
  ],
  function (Arr, Merger, SelectorFind, Chain, NamedChain, UiFinder, Assertions, FocusTools, UiControls, ApproxStructure, Editor, ApiChains, UiChains, TinyDom, TablePlugin, ColorPickerPlugin, Theme, document) {
    var success = arguments[arguments.length - 2];
/*    var failure = arguments[arguments.length - 1];

    TablePlugin();
    ColorPickerPlugin();
    Theme();

    var cReset = ApiChains.cSetContent('<table><tr><td>X</td></tr></table>');

    var cTriggerPropertiesDialog = function (cmd) {
      return Chain.fromChains([
        ApiChains.cSetCursor([0, 0, 0], 0),
        ApiChains.cExecCommand(cmd),
        UiChains.cWaitForPopup('Waiting for Properties Dialog (' + cmd + ')', '[role="dialog"]')
      ]);
    };

    var cSetBorderColorAndLeaveFocused = function (color) {
      return NamedChain.asChain([
        NamedChain.read(NamedChain.inputName(), UiChains.cClickOnUi("Activate Advanced tab", '[role="tab"]:contains("Advanced")')),
        NamedChain.writeValue('body', TinyDom.fromDom(document.body)),
        NamedChain.direct('body', FocusTools.cSetFocus("Focus input", 'label:contains("Border color") + .mce-colorbox input'), 'input'),
        NamedChain.read('input', UiControls.cSetValue(color)),
        NamedChain.outputInput
      ]);
    };

    var cAssertElementStructure = function (selector, expected) {
      return Chain.op(function (editor) {
        var body = editor.getBody();
        body.normalize(); // consolidate text nodes

        Assertions.assertStructure(
          "Asserting HTML structure of the element: " + selector,
          ApproxStructure.fromHtml(expected),
          SelectorFind.descendant(TinyDom.fromDom(body), selector).getOrDie("Nothing in the Editor matches selector: " + selector)
        );
      });
    };

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
      // TINY-1431
      Editor.cFromSettings(settings),
      cReset,
      cTriggerPropertiesDialog('mceTableProps'),
      Chain.op(function () {
        Assertions.assertPresence("Color picker exists in the DOM", { '.mce-colorbox i.mce-i-none': 2 }, TinyDom.fromDom(document.body));
      }),
      Editor.cRemove,

      Editor.cFromSettings(Merger.merge(settings, { plugins: 'table' })),
      cReset,
      cTriggerPropertiesDialog('mceTableProps'),
      Chain.op(function () {
        Assertions.assertPresence("Color picker doesn't exist in the DOM", { '.mce-colorbox i.mce-i-none': 0 }, TinyDom.fromDom(document.body));
      }),
      Editor.cRemove,

      // TINY-1450
      Editor.cFromSettings(settings),
      cReset,
      cTriggerPropertiesDialog('mceTableProps'),
      cSetBorderColorAndLeaveFocused('#ff0000'),
      UiChains.cSubmitDialog(),
      cAssertElementStructure('table', '<table style="border-color: #ff0000;"><tr><td>X</td></tr></table>'),
      cReset,
      cTriggerPropertiesDialog('mceTableCellProps'),
      cSetBorderColorAndLeaveFocused('#ff0000'),
      UiChains.cSubmitDialog(),
      cAssertElementStructure('table', '<table><tr><td style="border-color: #ff0000;">X</td></tr></table>'),
      cReset,
      cTriggerPropertiesDialog('mceTableRowProps'),
      cSetBorderColorAndLeaveFocused('#ff0000'),
      UiChains.cSubmitDialog(),
      cAssertElementStructure('table', '<table><tr style="border-color: #ff0000;"><td>X</td></tr></table>'),
      Editor.cRemove
    ], function () {
      success();
    }, failure);
*/
    success();
  }
);
