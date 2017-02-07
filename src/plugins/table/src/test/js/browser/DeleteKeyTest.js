asynctest(
  'browser.tinymce.plugins.table.DeleteKeyTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.plugins.table.Plugin',
    'ephox.mcagar.api.TinyLoader'
  ],
  function (Pipeline, LegacyUnit, Plugin, TinyLoader) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test("Delete empty like table cell contents", function (editor) {
      editor.getBody().innerHTML = (
        '<table><tbody>' +
        '<tr><td><p><br></p></td><td><p>a</p></td>' +
        '</tbody></table>' +
        '<p>x</p>'
      );

      LegacyUnit.setSelection(editor, 'td', 0);
      editor.fire('keydown', { keyCode: 46 });

      LegacyUnit.equal(
        editor.getContent(),
        '<table><tbody><tr><td>&nbsp;</td><td><p>a</p></td></tr></tbody></table><p>x</p>'
      );
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      plugins: 'table',
      indent: false,
      valid_styles: {
        '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
      }
    }, success, failure);
  }
);
