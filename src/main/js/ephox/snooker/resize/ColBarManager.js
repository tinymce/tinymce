define(
  'ephox.snooker.resize.ColBarManager',

  [
    'ephox.dragster.api.Dragger',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.resize.BarMutation',
    'ephox.snooker.resize.Bars',
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFind',
    'global!parseInt'
  ],

  function (Dragger, Option, Event, Events, BarMutation, Bars, Styles, Attr, Class, Css, DomEvent, Node, SelectorExists, SelectorFind, parseInt) {
    return function (wire, direction) {
      var mutation = BarMutation();
      var resizing = Dragger.transform(mutation, {});

      var hoverTable = Option.none();

      var getInt = function (element, property) {
        return parseInt(Css.get(element, property), 10);
      };

      /* Reposition the bar as the user drags */
      mutation.events.drag.bind(function (event) {
        var column = Attr.get(event.target(), 'data-column');
        if (column !== undefined) {
          var current = getInt(event.target(), 'left');
          Css.set(event.target(), 'left', current + event.xDelta() + 'px');
        }
      });

      /* Resize the column once the user releases the mouse */
      resizing.events.stop.bind(function () {
        mutation.get().each(function (target) {
          hoverTable.each(function (table) {
            var column = Attr.get(target, 'data-column');
            var newX = getInt(target, 'left');
            var oldX = parseInt(Attr.get(target, 'data-initial-left'), 10);
            var delta = newX - oldX;
            Attr.remove(target, 'data-initial-left');
            if (column !== undefined) events.trigger.adjustWidth(table, delta, parseInt(column, 10));
            Bars.colRefresh(wire, table, direction);
          });
        });
      });

      /* Start the dragging when the bar is clicked, storing the initial position. */
      var mousedown = DomEvent.bind(wire.parent(), 'mousedown', function (event) {
        if (Bars.isColBar(event.target())) {
          events.trigger.startAdjust();
          mutation.assign(event.target());
          Attr.set(event.target(), 'data-initial-left', parseInt(Css.get(event.target(), 'left'), 10));
          Class.add(event.target(), Styles.resolve('resizer-bar-dragging'));
          Css.set(event.target(), 'opacity', '0.2');
          resizing.go(wire.parent());
        }
      });

      /* When the mouse moves within the table, refresh the bars. */
      var mouseover = DomEvent.bind(wire.view(), 'mouseover', function (event) {
        if (Node.name(event.target()) === 'table' || SelectorExists.ancestor(event.target(), 'table')) {
          hoverTable = Node.name(event.target()) === 'table' ? Option.some(event.target()) : SelectorFind.ancestor(event.target(), 'table');
          hoverTable.each(function (ht) {
            Bars.colRefresh(wire, ht, direction);
          });
        }
      });

      /* When the mouse moves out of the table, hide the bars */
      var mouseout = DomEvent.bind(wire.view(), 'mouseout', function (event) {
        if (Node.name(event.target()) === 'table') {
          Bars.hide(wire);
        }
      });

      var destroy = function () {
        mousedown.unbind();
        mouseover.unbind();
        mouseout.unbind();
        firefoxDrag.unbind();
        resizing.destroy();
      };

      /* This is required on Firefox to stop the default drag behaviour interfering with dragster */
      var firefoxDrag = DomEvent.bind(wire.view(), 'dragstart', function (event) {
        event.raw().preventDefault();
      });

      var refresh = function (tbl) {
        Bars.colRefresh(wire, tbl, direction);
      };

      var events = Events.create({
        adjustWidth: Event(['table', 'delta', 'column']),
        startAdjust: Event([])
      });

      var hideBars = function () {
        Bars.hide(wire);
      };

      var showBars = function () {
        Bars.show(wire);
      };

      return {
        destroy: destroy,
        refresh: refresh,
        on: resizing.on,
        off: resizing.off,
        hideBars: hideBars,
        showBars: showBars,
        events: events.registry
      };
    };
  }
);
