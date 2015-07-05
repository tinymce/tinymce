define(
  'ephox.snooker.resize.BarManager',

  [
    'ephox.dragster.api.Dragger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.resize.AssistantManager',
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

  function (Dragger, Fun, Option, Event, Events, AssistantManager, BarMutation, Bars, Styles, Attr, Class, Css, DomEvent, Node, SelectorExists, SelectorFind, parseInt) {
    return function (wire, direction, hdirection) {
      var mutation = BarMutation();
      var resizing = Dragger.transform(mutation, {});

      var hoverTable = Option.none();


      /* Reposition the bar as the user drags */
      mutation.events.drag.bind(function (event) {
        var row = Attr.get(event.target(), 'data-row');
        if (row !== undefined) {
          var currentRow = AssistantManager.getInt(event.target(), 'top');
          Css.set(event.target(), 'top', currentRow + event.yDelta() + 'px');
        }

        var column = Attr.get(event.target(), 'data-column');
        if (column !== undefined) {
          var currentCol = AssistantManager.getInt(event.target(), 'left');
          Css.set(event.target(), 'left', currentCol + event.xDelta() + 'px');
        }
      });

      /* Resize the column once the user releases the mouse */
      resizing.events.stop.bind(function () {
        mutation.get().each(function (target) {
          hoverTable.each(function (table) {
            var row = Attr.get(target, 'data-row');
            var newY = AssistantManager.getInt(target, 'top');
            var oldY = parseInt(Attr.get(target, 'data-initial-top'), 10);
            var delta = newY - oldY;
            Attr.remove(target, 'data-initial-top');
            if (row !== undefined) events.trigger.adjustHeight(table, delta, parseInt(row, 10));
            Bars.rowRefresh(wire, table, hdirection);
          });
        });

        mutation.get().each(function (target) {
          hoverTable.each(function (table) {
            var column = Attr.get(target, 'data-column');
            var newX = AssistantManager.getInt(target, 'left');
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
        if (Bars.isRowBar(event.target())) {
          events.trigger.startAdjust();
          mutation.assign(event.target());
          Attr.set(event.target(), 'data-initial-top', parseInt(Css.get(event.target(), 'top'), 10));
          Class.add(event.target(), Styles.resolve('resizer-bar-dragging'));
          Css.set(event.target(), 'opacity', '0.2');
          resizing.go(wire.parent());
        }

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
            Bars.rowRefresh(wire, ht, hdirection);
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
        Bars.rowRefresh(wire, tbl, hdirection);
        Bars.colRefresh(wire, tbl, direction);
      };

      var events = Events.create({
        adjustHeight: Event(['table', 'delta', 'row']),
        adjustWidth: Event(['table', 'delta', 'column']),
        startAdjust: Event([])
      });

      return {
        destroy: destroy,
        refresh: refresh,
        on: resizing.on,
        off: resizing.off,
        hideBars: Fun.curry(AssistantManager.hideBars, wire),
        showBars: Fun.curry(AssistantManager.showBars, wire),
        events: events.registry
      };
    };
  }
);
