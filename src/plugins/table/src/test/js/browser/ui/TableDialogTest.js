asynctest(
  'browser.tinymce.plugins.table.TableDialogTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Step',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.ApproxStructure',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyUi',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.table.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, GeneralSteps, Logger, Chain, Step, Assertions, ApproxStructure, SelectorFind, TinyLoader, TinyApis, TinyUi, Element, Plugin, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Plugin();
    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var ui = TinyUi(editor);
      var api = TinyApis(editor);

      var sAssertElementStructure = function (selector, expected) {
        return Step.sync(function () {
          var body = editor.getBody();
          body.normalize(); // consolidate text nodes

          Assertions.assertStructure(
            "Asserting HTML structure of the element: " + selector,
            ApproxStructure.fromHtml(expected),
            SelectorFind.descendant(Element.fromDom(body), selector).getOrDie("Nothing in the Editor matches selector: " + selector)
          );
        });
      };

      var cWaitForDialog = function (label) {
        // looking for dialogs by aria-label
        return ui.cWaitForPopup('wait for ' + label + ' dialog', 'div[aria-label="' + label + '"][role="dialog"]');
      };

      Pipeline.async({}, [
        Logger.t("Table properties dialog (get data from plain table)", GeneralSteps.sequence([
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cAssertDialogContents({
              "align": "",
              "border": "",
              "caption": false,
              "cellpadding": "",
              "cellspacing": "",
              "height": "",
              "width": "",
              "backgroundColor": "",
              "borderColor": "",
              "borderStyle": "",
              "style": ""
            }),
            ui.cSubmitDialog()
          ])
        ])),

        Logger.t("Table properties dialog (get/set data from/to plain table, no adv tab)", GeneralSteps.sequence([
          api.sSetSetting('table_advtab', false),
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cAssertDialogContents({
              "align": "",
              "border": "",
              "caption": false,
              "cellpadding": "",
              "cellspacing": "",
              "height": "",
              "width": ""
            }),
            ui.cFillDialogWith({
              width: "100",
              height: "101"
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure('table', '<table style="width: 100px; height: 101px;"><tbody><tr><td>X</td></tr></tbody></table>'),
          api.sDeleteSetting('table_advtab')
        ])),

        Logger.t("Table cell properties dialog (get/set data from/to plain table, no adv tab)", GeneralSteps.sequence([
          api.sSetSetting('table_cell_advtab', false),
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableCellProps'),
          Chain.asStep({}, [
            cWaitForDialog("Cell properties"),
            ui.cAssertDialogContents({
              "width": "",
              "height": "",
              "type": "td",
              "scope": "",
              "align": "",
              "valign": ""
            }),
            ui.cFillDialogWith({
              width: "100",
              height: "101"
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure('table', '<table><tbody><tr><td style="width: 100px; height: 101px;">X</td></tr></tbody></table>'),
          api.sDeleteSetting('table_cell_advtab')
        ])),

        Logger.t("Table row properties dialog (get/set data from/to plain table, no adv tab)", GeneralSteps.sequence([
          api.sSetSetting('table_row_advtab', false),
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableRowProps'),
          Chain.asStep({}, [
            cWaitForDialog("Row properties"),
            ui.cAssertDialogContents({
              "type": "tbody",
              "align": "",
              "height": ""
            }),
            ui.cFillDialogWith({
              width: "100",
              height: "101"
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure('table', '<table><tbody><tr style="height: 101px;"><td>X</td></tr></tbody></table>'),
          api.sDeleteSetting('table_row_advtab')
        ])),

        Logger.t("Table properties dialog (get/set data from/to plain table, class list)", GeneralSteps.sequence([
          api.sSetSetting('table_class_list', [{ title: 'Class1', value: 'class1' }]),
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cAssertDialogContents({
              "align": "",
              "border": "",
              "caption": false,
              "cellpadding": "",
              "cellspacing": "",
              "height": "",
              "width": "",
              "backgroundColor": "",
              "borderColor": "",
              "borderStyle": "",
              "style": "",
              "class": ""
            }),
            ui.cFillDialogWith({
              width: "100",
              height: "101"
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure('table', '<table style="width: 100px; height: 101px;"><tbody><tr><td>X</td></tr></tbody></table>'),
          api.sDeleteSetting('table_class_list')
        ])),

        Logger.t("Table properties dialog (get data from full table)", GeneralSteps.sequence([
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
            cWaitForDialog("Table properties"),
            ui.cAssertDialogContents({
              "align": "",
              "border": "4",
              "caption": true,
              "cellpadding": "3",
              "cellspacing": "2",
              "height": "101",
              "width": "100",
              "backgroundColor": "",
              "borderColor": "",
              "borderStyle": "",
              "style": "width: 100px; height: 101px;"
            }),
            ui.cSubmitDialog()
          ])
        ])),

        Logger.t("Table properties dialog (add caption)", GeneralSteps.sequence([
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cFillDialogWith({
              caption: true
            }),
            ui.cSubmitDialog()
          ]),
          api.sAssertContent('<table><caption>&nbsp;</caption><tbody><tr><td>X</td></tr></tbody></table>')
        ])),

        Logger.t("Table properties dialog (remove caption)", GeneralSteps.sequence([
          api.sSetContent('<table><caption>&nbsp;</caption><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cFillDialogWith({
              caption: false
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure('table', '<table><tbody><tr><td>X</td></tr></tbody></table>')
        ])),

        Logger.t("Table properties dialog (change size in pixels)", GeneralSteps.sequence([
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cFillDialogWith({
              width: 100,
              height: 101
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure('table', '<table style="width: 100px; height: 101px;"><tbody><tr><td>X</td></tr></tbody></table>')
        ])),

        Logger.t("Table properties dialog (change size in pixels)", GeneralSteps.sequence([
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cFillDialogWith({
              width: 100,
              height: 101
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure('table', '<table style="width: 100px; height: 101px;"><tbody><tr><td>X</td></tr></tbody></table>')
        ])),

        Logger.t("Table properties dialog (change size in %)", GeneralSteps.sequence([
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cFillDialogWith({
              width: "100%",
              height: "101%"
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure('table', '<table style="width: 100%; height: 101%;"><tbody><tr><td>X</td></tr></tbody></table>')
        ])),

        Logger.t("Table properties dialog (change: border,cellpadding,cellspacing,align,backgroundColor,borderColor)", GeneralSteps.sequence([
          api.sSetContent('<table style="border-color: red; background-color: blue"><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cFillDialogWith({
              border: "1",
              cellpadding: "2",
              cellspacing: "3",
              align: "right"
            }),
            ui.cSubmitDialog()
          ]),
          sAssertElementStructure(
            'table',
            '<table style="float: right; border-color: red; background-color: blue;" border="1" cellspacing="3" cellpadding="2">' +
            '<tbody><tr><td>X</td></tr></tbody></table>'
          )
        ])),

        Logger.t("Table properties dialog css border", GeneralSteps.sequence([
          api.sSetSetting('table_style_by_css', true),
          api.sSetContent('<table><tr><td>X</td><td>Z</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cFillDialogWith({
              border: "1",
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

        Logger.t("Css from the style field of the Advanced Tab should always have priority", GeneralSteps.sequence([
          api.sSetContent('<table><tr><td>X</td></tr></table>'),
          api.sSetCursor([0, 0, 0], 0),
          api.sExecCommand('mceTableProps'),
          Chain.asStep({}, [
            cWaitForDialog("Table properties"),
            ui.cFillDialogWith({
              width: 100,
              height: 101,
              style: "width: 200px; height: 201px;"
            }),
            ui.cSubmitDialog()
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
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
