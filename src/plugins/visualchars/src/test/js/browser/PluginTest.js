asynctest(
  'browser.tinymce.plugins.visualchars.PluginTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.visualchars.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, Plugin, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Plugin();
    Theme();

    suite.test('Visualchar toggle on/off', function (editor) {

      editor.setContent('<p>a&nbsp;&nbsp;b</p>');
      LegacyUnit.equal(0, editor.dom.select('span').length);

      // first click on
      editor.execCommand('mceVisualChars');
      LegacyUnit.equal(
        '<p>a<span data-mce-bogus="1" class="mce-nbsp">&nbsp;</span>' +
        '<span data-mce-bogus="1" class="mce-nbsp">&nbsp;</span>b</p>',
        editor.getContent({ format: 'raw' })
      );
      LegacyUnit.equal(2, editor.dom.select('span').length);

      // then off
      editor.execCommand('mceVisualChars');
      LegacyUnit.equal('<p>a&nbsp;&nbsp;b</p>', editor.getContent({ format: 'raw' }));
      LegacyUnit.equal(0, editor.dom.select('span').length);

      // second click on
      editor.execCommand('mceVisualChars');
      LegacyUnit.equal(
        '<p>a<span data-mce-bogus="1" class="mce-nbsp">&nbsp;</span>' +
        '<span data-mce-bogus="1" class="mce-nbsp">&nbsp;</span>b</p>',
        editor.getContent({ format: 'raw' })
      );
      LegacyUnit.equal(2, editor.dom.select('span').length);

      // then off
      editor.execCommand('mceVisualChars');
      LegacyUnit.equal(0, editor.dom.select('span').length);
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      plugins: 'visualchars',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
