import {
    ApproxStructure, Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, UiControls,
    UiFinder
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element, SelectorFind } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.TableDialogTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const api = TinyApis(editor);

    const sAssertElementStructure = function (selector, expected) {
      return Step.sync(function () {
        const body = editor.getBody();
        body.normalize(); // consolidate text nodes

        Assertions.assertStructure(
          'Asserting HTML structure of the element: ' + selector,
          ApproxStructure.fromHtml(expected),
          SelectorFind.descendant(Element.fromDom(body), selector).getOrDie('Nothing in the Editor matches selector: ' + selector)
        );
      });
    };

    const cWaitForDialog = function (label) {
      // looking for dialogs by aria-label
      return ui.cWaitForPopup('wait for ' + label + ' dialog', 'div[aria-label="' + label + '"][role="dialog"]');
    };

    const cFakeEventOn = function (event) {
      return Chain.op(function (elm) {
        DOMUtils.DOM.fire(elm.dom(), event);
      });
    };

    Pipeline.async({}, [
      Logger.t('Table properties dialog (get data from plain table)', GeneralSteps.sequence([
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cAssertDialogContents({
            align: '',
            border: '',
            caption: false,
            cellpadding: '',
            cellspacing: '',
            height: '',
            width: '',
            backgroundColor: '',
            borderColor: '',
            borderStyle: '',
            style: ''
          }),
          ui.cSubmitDialog()
        ])
      ])),

      Logger.t('Table properties dialog (get/set data from/to plain table, no adv tab)', GeneralSteps.sequence([
        api.sSetSetting('table_advtab', false),
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cAssertDialogContents({
            align: '',
            border: '',
            caption: false,
            cellpadding: '',
            cellspacing: '',
            height: '',
            width: ''
          }),
          ui.cFillDialogWith({
            width: '100',
            height: '101'
          }),
          ui.cSubmitDialog()
        ]),
        sAssertElementStructure('table', '<table style="width: 100px; height: 101px;"><tbody><tr><td>X</td></tr></tbody></table>'),
        api.sDeleteSetting('table_advtab')
      ])),

      Logger.t('Table cell properties dialog (get/set data from/to plain table, no adv tab)', GeneralSteps.sequence([
        api.sSetSetting('table_cell_advtab', false),
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableCellProps'),
        Chain.asStep({}, [
          cWaitForDialog('Cell properties'),
          ui.cAssertDialogContents({
            width: '',
            height: '',
            type: 'td',
            scope: '',
            align: '',
            valign: ''
          }),
          ui.cFillDialogWith({
            width: '100',
            height: '101'
          }),
          ui.cSubmitDialog()
        ]),
        sAssertElementStructure('table', '<table><tbody><tr><td style="width: 100px; height: 101px;">X</td></tr></tbody></table>'),
        api.sDeleteSetting('table_cell_advtab')
      ])),

      Logger.t('Table row properties dialog (get/set data from/to plain table, no adv tab)', GeneralSteps.sequence([
        api.sSetSetting('table_row_advtab', false),
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableRowProps'),
        Chain.asStep({}, [
          cWaitForDialog('Row properties'),
          ui.cAssertDialogContents({
            type: 'tbody',
            align: '',
            height: ''
          }),
          ui.cFillDialogWith({
            width: '100',
            height: '101'
          }),
          ui.cSubmitDialog()
        ]),
        sAssertElementStructure('table', '<table><tbody><tr style="height: 101px;"><td>X</td></tr></tbody></table>'),
        api.sDeleteSetting('table_row_advtab')
      ])),

      Logger.t('Table properties dialog (get/set data from/to plain table, class list)', GeneralSteps.sequence([
        api.sSetSetting('table_class_list', [{ title: 'Class1', value: 'class1' }]),
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          Chain.fromParent(cWaitForDialog('Table properties'), [
            Chain.fromChains([
              ui.cAssertDialogContents({
                align: '',
                border: '',
                caption: false,
                cellpadding: '',
                cellspacing: '',
                height: '',
                width: '',
                backgroundColor: '',
                borderColor: '',
                borderStyle: '',
                style: '',
                class: 'class1'
              })
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('label:contains("Width") + input'),
              UiControls.cSetValue('100px'),
              cFakeEventOn('change')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('label:contains("Height") + input'),
              UiControls.cSetValue('101px'),
              cFakeEventOn('change')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('label:contains("Class") + div > button'),
              Mouse.cClick
            ])
          ])
        ]),
        Chain.asStep(TinyDom.fromDom(document.body), [
          UiFinder.cFindIn('div[role="menuitem"] > span:contains("Class1")'),
          Mouse.cClick
        ]),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          UiFinder.cFindIn('button:contains("Ok")'),
          Mouse.cClick
        ]),
        sAssertElementStructure('table', '<table class="class1" style="width: 100px; height: 101px;"><tbody><tr><td>X</td></tr></tbody></table>'),
        api.sDeleteSetting('table_class_list')
      ])),

      Logger.t('Table properties dialog (get data from full table)', GeneralSteps.sequence([
        api.sSetContent(
          '<table style="width: 100px; height: 101px;" border="4" cellspacing="2" cellpadding="3">' +
          '<caption>&nbsp;</caption>' +
          '<tbody>' +
          '<tr>' +
          '<td>&nbsp;</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        ),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cAssertDialogContents({
            align: '',
            border: '4',
            caption: true,
            cellpadding: '3',
            cellspacing: '2',
            height: '101px',
            width: '100px',
            backgroundColor: '',
            borderColor: '',
            borderStyle: '',
            style: 'width: 100px; height: 101px;'
          }),
          ui.cSubmitDialog()
        ])
      ])),

      Logger.t('Table properties dialog (add caption)', GeneralSteps.sequence([
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cFillDialogWith({
            caption: true
          }),
          ui.cSubmitDialog()
        ]),
        api.sAssertContent('<table><caption>&nbsp;</caption><tbody><tr><td>X</td></tr></tbody></table>')
      ])),

      Logger.t('Table properties dialog (remove caption)', GeneralSteps.sequence([
        api.sSetContent('<table><caption>&nbsp;</caption><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cFillDialogWith({
            caption: false
          }),
          ui.cSubmitDialog()
        ]),
        sAssertElementStructure('table', '<table><tbody><tr><td>X</td></tr></tbody></table>')
      ])),

      Logger.t('Table properties dialog (change size in pixels)', GeneralSteps.sequence([
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cFillDialogWith({
            width: 100,
            height: 101
          }),
          ui.cSubmitDialog()
        ]),
        sAssertElementStructure('table', '<table style="width: 100px; height: 101px;"><tbody><tr><td>X</td></tr></tbody></table>')
      ])),

      Logger.t('Table properties dialog (change size in %)', GeneralSteps.sequence([
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cFillDialogWith({
            width: '100%',
            height: '101%'
          }),
          ui.cSubmitDialog()
        ]),
        sAssertElementStructure('table', '<table style="width: 100%; height: 101%;"><tbody><tr><td>X</td></tr></tbody></table>')
      ])),

      Logger.t('Table properties dialog (change: border,cellpadding,cellspacing,align,backgroundColor,borderColor)', GeneralSteps.sequence([
        api.sSetContent('<table style="border-color: red; background-color: blue"><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cFillDialogWith({
            border: '1',
            cellpadding: '2',
            cellspacing: '3',
            align: 'right'
          }),
          ui.cSubmitDialog()
        ]),
        sAssertElementStructure(
          'table',
          '<table style="float: right; border-color: red; background-color: blue;" border="1" cellspacing="3" cellpadding="2">' +
          '<tbody><tr><td>X</td></tr></tbody></table>'
        )
      ])),

      Logger.t('Table properties dialog css border', GeneralSteps.sequence([
        api.sSetSetting('table_style_by_css', true),
        api.sSetContent('<table><tr><td>X</td><td>Z</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          cWaitForDialog('Table properties'),
          ui.cFillDialogWith({
            border: '1',
            borderColor: 'green'
          }),
          ui.cSubmitDialog()
        ]),
        sAssertElementStructure(
          'table',
          '<table style=\"border-color: green; border-width: 1px;\" data-mce-border-color=\"green\" data-mce-border=\"1\">' +
          '<tbody><tr><td style=\"border-color: green; border-width: 1px;\">X</td>' +
          '<td style=\"border-color: green; border-width: 1px;\">Z</td></tr></tbody>' +
          '</table>'
        ),
        api.sDeleteSetting('table_style_by_css')
      ])),

      Logger.t('changing the style field on adv tab changes the height and width', GeneralSteps.sequence([
        api.sSetContent('<table><tr><td>X</td></tr></table>'),
        api.sSetCursor([0, 0, 0], 0),
        api.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          Chain.fromParent(cWaitForDialog('Table properties'),
            [
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Width") + input'),
                UiControls.cGetValue,
                Assertions.cAssertEq('should be changed automatically on style change', '')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Height") + input'),
                UiControls.cGetValue,
                Assertions.cAssertEq('should be changed automatically on style change', '')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Style") + input'),
                UiControls.cSetValue('width: 200px; height: 201px;'),
                cFakeEventOn('change')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Width") + input'),
                UiControls.cGetValue,
                Assertions.cAssertEq('should be changed automatically on style change', '200px')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Height") + input'),
                UiControls.cGetValue,
                Assertions.cAssertEq('should be changed automatically on style change', '201px')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('button:contains("Ok")'),
                Mouse.cClick
              ])
            ]
          )
        ]),
        sAssertElementStructure('table', '<table style="width: 200px; height: 201px;"><tbody><tr><td>X</td></tr></tbody></table>')
      ]))

    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,border-width,background-color,border,padding,border-spacing,border-collapse'
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
