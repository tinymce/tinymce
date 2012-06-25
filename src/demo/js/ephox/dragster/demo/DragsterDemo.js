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



      var blocker = $('<div/>').css({
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        'z-index': 1000
      }).addClass('blocker');
      console.log('blocker', blocker);

      $(document.body).append(blocker);

      $(blocker).mouseout(function () {
        console.log('exited document');
      });

      container.append(dialog.element().dom());

      $('#ephox-ui').append(container);

      dialog.show(10, 10);
    };
  }
);
