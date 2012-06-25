define(
  'ephox.dragster.demo.DragsterDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.dragster.api.Dragster',
    'ephox.sugar.Element',
    'ephox.sugar.Insert',
    'ephox.sugar.TextNode'
  ],

  function ($, Dragster, Element, Insert, TextNode) {
    return function () {
      var container = $('<div/>').append('Hi.');

      var dialog = Dragster();

      var titlebar = TextNode('title', document);

      var content = (function () {
        var text = TextNode('This is the body of the text ...', document);
        var p = Element(document.createElement('p'));
        Insert.append(text, p);
        return p;
      })();

      dialog.setHeader(titlebar);
      dialog.setContent(content);

      // Demonstrate that dialog can change after being created.
      setTimeout(function () {
        dialog.setHeader(Element(document.createTextNode('blah')));
        dialog.setContent(Element(document.createTextNode('new content')));
      }, 5000);

      container.append(dialog.element().dom());

      $('#ephox-ui').append(container);

      dialog.show(10, 10);
    };
  }
);
