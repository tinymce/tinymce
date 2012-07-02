define(
  'ephox.dragster.demo.DragsterDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.dragster.api.Dragster',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function ($, Dragster, Element, Insert) {
    return function () {
      var container = $('<div/>').append('Hi.');

      var dialog = Dragster();

      var titlebar = Element.fromText('title', document);

      var content = (function () {
        var text = Element.fromText('This is the body of the text ...', document);
        var p = Element.fromTag('p');
        Insert.append(p, text);
        return p;
      })();

      dialog.setHeader(titlebar);
      dialog.setContent(content);

      // Demonstrate that dialog can change after being created.
      setTimeout(function () {
        dialog.setHeader(Element.fromText('blah'));
        dialog.setContent(Element.fromText('new content'));
      }, 5000);

      container.append(dialog.element().dom());

      $('#ephox-ui').append(container);

      dialog.show(10, 10);
    };
  }
);
