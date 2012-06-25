define(
  'ephox.dragster.api.Dragster',

  [
    'ephox.dragster.move.Blocker',
    'ephox.dragster.move.Drag',
    'ephox.dragster.style.Styles',
    'ephox.sugar.Class',
    'ephox.sugar.Css',
    'ephox.sugar.Element',
    'ephox.sugar.Events',
    'ephox.sugar.Insert',
    'ephox.sugar.Remove',
    'ephox.sugar.Visibility'
  ],

  function (Blocker, Drag, Styles, Class, Css, Element, Events, Insert, Remove, Visibility) {

    var setPosition = function (element, x, y) {
      Css.set(element, 'left', x);
      Css.set(element, 'top', y);
    };

    var container = function (clazz) {
      var div = document.createElement('div');
      var element = Element(div);
      Class.add(element, Styles.resolve(clazz));
      return element;
    };

    return function () {

      var dialog = container('dialog');
      var titlebar = container('titlebar');
      var content = container('content');

      Insert.append(titlebar, dialog);
      Insert.append(content, dialog);
   
      var blocker = Blocker();
      var drag = Drag(dialog, titlebar, blocker);

      Events.bind(dialog, 'mousedown', drag.mousedown);
      Events.bind(blocker, 'mouseup', drag.mouseup);
      Events.bind(blocker, 'mousemove', drag.mousemove);
      Events.bind(blocker, 'mouseout', drag.stop);

      var element = function () {
        return dialog;
      };

      var setContent = function (newContent) {
        Remove.clear(content);
        Insert.append(newContent, content);
      };

      var setHeader = function (newHeader) {
        Remove.clear(titlebar);
        Insert.append(newHeader, titlebar);
      };

      var show = function (x, y) {
        Css.set(dialog, 'position', 'absolute');
        setPosition(dialog, x, y);
        Visibility.show(dialog);
      };

      var hide = function () {
        Visibility.hide(dialog);
        drag.stop();
      };

      hide();

      return {
        element: element,
        setContent: setContent,
        setHeader: setHeader,
        show: show,
        hide: hide
      };
    };
  }
);


