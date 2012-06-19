define(
  'ephox.dragster.api.Dragster',

  [
    'ephox.dragster.move.Drag',
    'ephox.dragster.move.Mover',
    'ephox.dragster.style.Styles',
    'ephox.sugar.Class',
    'ephox.sugar.Css',
    'ephox.sugar.Element',
    'ephox.sugar.Events',
    'ephox.sugar.Insert',
    'ephox.sugar.Visibility'
  ],

  function (Drag, Mover, Styles, Class, Css, Element, Events, Insert, Visibility) {

    var textNode = function (value) {
      return Element(document.createTextNode(value));
    };

    var setPosition = function (element, x, y) {
      Css.set(element, 'left', x);
      Css.set(element, 'top', y);
    };

    return function (title) {

      var dialog = Element(document.createElement('div'));
      var titlebar = Element(document.createElement('div'));

      Insert.append(textNode(title), titlebar);

      var content = Element(document.createElement('div'));

      Insert.append(textNode('Hi. Look at me.'), content);

      Class.add(dialog, Styles.resolve('dialog'));
      Class.add(titlebar, Styles.resolve('titlebar'));
      Class.add(content, Styles.resolve('content'));

      Insert.append(titlebar, dialog);
      Insert.append(content, dialog);

      var mover = Mover();
      var drag = Drag(dialog, titlebar, mover);

      Events.bind(dialog, 'mousedown', drag.mousedown);
      Events.bind(dialog, 'mouseup', drag.mouseup);
      Events.bind(dialog, 'mousemove', drag.mousemove);

      var element = function () {
        return dialog;
      };

      var show = function (x, y) {
        Css.set(dialog, 'position', 'absolute');
        setPosition(dialog, x, y);
        Visibility.show(dialog);
      };

      return {
        element: element,
        show: show
      };
    };
  }
);


