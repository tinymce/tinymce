// import { Arr } from '@ephox/katamari';
// import { Merger } from '@ephox/katamari';
// import { SelectorFind } from '@ephox/sugar';
// import { Chain } from '@ephox/agar';
// import { NamedChain } from '@ephox/agar';
// import { UiFinder } from '@ephox/agar';
// import { Assertions } from '@ephox/agar';
// import { FocusTools } from '@ephox/agar';
// import { UiControls } from '@ephox/agar';
// import { ApproxStructure } from '@ephox/agar';
// import { Editor } from '@ephox/mcagar';
// import { ApiChains } from '@ephox/mcagar';
// import { UiChains } from '@ephox/mcagar';
// import { TinyDom } from '@ephox/mcagar';
// import TablePlugin from 'tinymce/plugins/table/Plugin';
// import ColorPickerPlugin from 'tinymce/plugins/colorpicker/Plugin';
// import SilverTheme from '../../../../../themes/silver/main/ts/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.plugins.table.ColorPickerTest', (success, failure) => {
/*      TablePlugin();
      ColorPickerPlugin();
      SilverTheme();

      var cReset = ApiChains.cSetContent('<table><tr><td>X</td></tr></table>');

      var cTriggerPropertiesDialog = (cmd) => {
        return Chain.fromChains([
          ApiChains.cSetCursor([0, 0, 0], 0),
          ApiChains.cExecCommand(cmd),
          UiChains.cWaitForPopup('Waiting for Properties Dialog (' + cmd + ')', '[role="dialog"]')
        ]);
      };

      var cSetBorderColorAndLeaveFocused = (color) => {
        return NamedChain.asChain([
          NamedChain.read(NamedChain.inputName(), UiChains.cClickOnUi("Activate Advanced tab", '[role="tab"]:contains("Advanced")')),
          NamedChain.writeValue('body', TinyDom.fromDom(document.body)),
          NamedChain.direct('body', FocusTools.cSetFocus("Focus input", 'label:contains("Border color") + .mce-colorbox input'), 'input'),
          NamedChain.read('input', UiControls.cSetValue(color)),
          NamedChain.outputInput
        ]);
      };

      var cAssertElementStructure = (selector, expected) => {
        return Chain.op((editor) => {
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
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
      };

      Chain.pipeline([
        // TINY-1431
        Editor.cFromSettings(settings),
        cReset,
        cTriggerPropertiesDialog('mceTableProps'),
        Chain.op(() => {
          Assertions.assertPresence("Color picker exists in the DOM", { '.mce-colorbox i.mce-i-none': 2 }, TinyDom.fromDom(document.body));
        }),
        Editor.cRemove,

        Editor.cFromSettings(Merger.merge(settings, { plugins: 'table' })),
        cReset,
        cTriggerPropertiesDialog('mceTableProps'),
        Chain.op(() => {
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
      ], () => {
        success();
      }, failure);
  */
  success();
});
