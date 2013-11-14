define(
  'ephox.snooker.tbio.resize.box.BoxHandles',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.adjust.Border',
    'ephox.snooker.style.Styles',
    'ephox.snooker.tbio.resize.box.Resizer',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove'
  ],

  function (Event, Events, Border, Styles, Resizer, Class, Classes, Css, Element, Insert, InsertAll, Remove) {
    return function () {

      // INVESTIGATE: Should I care about the document coming in?
      var container = Element.fromTag('div');
      Css.set(container, 'position', 'relative');
      Css.set(container, 'display', 'inline-block');
      Classes.add(container, [ Styles.resolve('adjust-container') ]);

      // Can't quite use Sugar wrap, because the wrapping is a little more customised.
      var resizer = Resizer.nu();
      var border = Border.nu();

      InsertAll.append(container, [ border.element(), resizer.element() ]);

      var show = function (target) {
        // Until I can get it showing and hiding properly, this "hide" is needed to avoid a HIERARCHY_REQUEST_ERR
        // when I click and release on the resize handle.
        hide();
        Insert.before(target, container);
        border.surround(target);
        Class.add(target, Styles.resolve('adjust-selected'));
        Class.add(target);
      };

      var hide = function () {
        var target = border.subject();
        target.each(function (t) {
          Insert.before(container, t);
          Remove.remove(container);
          Class.remove(t, Styles.resolve('adjust-selected'));
          // This was doing: Classes.remove(element, [ resizeBlock, resizeContainer, resizer, resizeTarget ]);
          // Ephemera.clean(t);
        });
      };

      var isOver = function (target) {
        return Class.has(target, Styles.resolve('adjust-selected'));
      };

      var destroy = function () {
        resizer.destroy();
        hide();
      };

      var events = Events.create({
        resize: Event([]),
        width: Event(['column']),
        height: Event(['row'])
      });

      resizer.events.click.bind(function () {
        events.trigger.resize();
      });

      return {
        destroy: destroy,
        show: show,
        hide: hide,
        isOver: isOver,
        events: events.registry
      };
    };
  }
);
