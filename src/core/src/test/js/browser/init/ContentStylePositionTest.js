asynctest(
  'browser.tinymce.core.init.ContentStylePositionTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Pipeline, Step, Arr, TinyLoader, Compare, Element, Node, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    var contentStyle = '.class {color: blue;}';

    TinyLoader.setup(function (editor, onSuccess, onFailure) {

      Pipeline.async({}, [
        Step.sync(function () {
          var headStuff = editor.getDoc().head.querySelectorAll('link, style');
          var linkIndex = Arr.findIndex(headStuff, function (elm) {
            return Node.name(Element.fromDom(elm)) === 'link';
          }).getOrDie('could not find link elemnt');
          var styleIndex = Arr.findIndex(headStuff, function (elm) {
            return elm.innerText === contentStyle;
          }).getOrDie('could not find content style tag');

          Assertions.assertEq('style tag should be after link tag', linkIndex < styleIndex, true);
        })
      ], onSuccess, onFailure);
    }, {
      content_style: contentStyle,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);