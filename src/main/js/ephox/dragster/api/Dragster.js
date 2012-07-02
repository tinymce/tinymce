define(
  'ephox.dragster.api.Dragster',

  [
    'ephox.dragster.move.Blocker',
    'ephox.dragster.move.Drag',
    'ephox.dragster.style.Styles',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Event',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Visibility'
  ],

  function (Blocker, Drag, Styles, Class, Css, Element, Event, Insert, Remove, Visibility) {

    var setPosition = function (element, x, y) {
      Css.set(element, 'left', x);
      Css.set(element, 'top', y);
    };

    var container = function (clazz) {
      var element = Element.fromTag('div');
      Class.add(element, Styles.resolve(clazz));
      return element;
    };

    return function () {

      var dialog = container('dialog');
      var titlebar = container('titlebar');
      var content = container('content');

      var viewer = Visibility.displayToggler(dialog, 'block');

      Insert.append(dialog, titlebar);
      Insert.append(dialog, content);
   
      var blocker = Blocker();
      var drag = Drag(dialog, titlebar, blocker);

      Event.bind(dialog, 'mousedown', drag.mousedown);
      Event.bind(blocker, 'mouseup', drag.mouseup);
      Event.bind(blocker, 'mousemove', drag.mousemove);
      Event.bind(blocker, 'mouseout', drag.stop);

      var element = function () {
        return dialog;
      };

      var setContent = function (newContent) {
        Remove.empty(content);
        Insert.append(content, newContent);
      };

      var setHeader = function (newHeader) {
        Remove.empty(titlebar);
        Insert.append(titlebar, newHeader);
      };

      var show = function (x, y) {
        Css.set(dialog, 'position', 'absolute');
        setPosition(dialog, x, y);
        viewer.show();
      };

      var hide = function () {
        viewer.hide();
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


