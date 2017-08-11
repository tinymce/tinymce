asynctest(
  'browser.tinymce.core.dom.ControlSelectionTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Mouse, Pipeline, Step, TinyApis, TinyLoader, Hierarchy, Element, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sContextMenuClickInMiddleOf = function (editor, elementPath) {
      return Step.sync(function () {
        var element = Hierarchy.follow(Element.fromDom(editor.getBody()), elementPath).getOrDie().dom();
        var rect = element.getBoundingClientRect();
        var clientX = (rect.left + rect.width / 2), clientY = (rect.top + rect.height / 2);

        editor.fire('mousedown', { target: element, clientX: clientX, clientY: clientY, button: 2 });
        editor.fire('mouseup', { target: element, clientX: clientX, clientY: clientY, button: 2 });
        editor.fire('contextmenu', { target: element, clientX: clientX, clientY: clientY });
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Select image by context menu clicking on it', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==" width="100" height="100"></p>'),
          sContextMenuClickInMiddleOf(editor, [0, 0]),
          tinyApis.sAssertSelection([0], 0, [0], 1)
        ]))
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      content_style: 'body.mce-content-body  { margin: 0 }'
    }, success, failure);
  }
);