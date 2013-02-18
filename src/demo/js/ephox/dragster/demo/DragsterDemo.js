define(
  'ephox.dragster.demo.DragsterDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.dragster.api.Dragster',
    'ephox.dragster.transform.Grow',
    'ephox.dragster.transform.Relocate',
    'ephox.dragster.viper.Asp',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind'
  ],

  function ($, Dragster, Grow, Relocate, Asp, Css, Element, Insert, SelectorFind) {
    return function () {
      // var container = $('<div/>').append('Hi.');

      // var dialog = Dragster();

      // var titlebar = Element.fromText('title', document);

      // var content = (function () {
      //   var text = Element.fromText('This is the body of the text ...', document);
      //   var p = Element.fromTag('p');
      //   Insert.append(p, text);
      //   return p;
      // })();

      // dialog.setHeader(titlebar);
      // dialog.setContent(content);

      // // Demonstrate that dialog can change after being created.
      // setTimeout(function () {
      //   dialog.setHeader(Element.fromText('blah'));
      //   dialog.setContent(Element.fromText('new content'));
      // }, 5000);

      // container.append(dialog.element().dom());

      // $('#ephox-ui').append(container);

      // dialog.show(10, 10);

      var div = Element.fromTag('div');
      Css.setAll(div, {
        position: 'absolute',
        left: '10px',
        top: '20px',
        width: '100px',
        height: '50px',
        background: 'blue'
      });

      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
      Insert.append(ephoxUi, div);

      Asp.transform(Element.fromDom(document.body), div, Relocate.both(div));
    };
  }
);
