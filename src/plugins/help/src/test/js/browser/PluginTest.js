asynctest('browser.plugin.PluginTest', [
  'tinymce.help.Plugin',
  'ephox.mcagar.api.TinyLoader',
  'ephox.agar.api.Pipeline',
  'ephox.mcagar.api.TinyApis',
  'ephox.mcagar.api.TinyUi'
], function (
	Plugin, TinyLoader, Pipeline, TinyApis, TinyUi
) {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var tinyApis = TinyApis(editor); // eslint-disable-line
		var tinyUi = TinyUi(editor); // eslint-disable-line

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('click on button', 'button'),
      tinyUi.sWaitForPopup('Wait for dialog popup', 'div.mce-window-head:contains("Help")')
    ], onSuccess, onFailure);
  }, {
    plugins: 'help',
    toolbar: 'help'
  }, success, failure);
});
