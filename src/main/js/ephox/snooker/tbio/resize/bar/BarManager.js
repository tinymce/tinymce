define(
  'ephox.snooker.tbio.resize.bar.BarManager',

  [
    'ephox.dragster.api.Dragger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.tbio.resize.bar.Bars',
    'ephox.snooker.tbio.resize.common.TargetMutation',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Dragger, Fun, Option, Event, Events, Bars, TargetMutation, Attr, Css, DomEvent, Element, Node, SelectorExists, SelectorFind) {
    return function (container) {
      var mutation = TargetMutation();
      var resizing = Dragger.transform(mutation, {});

      var hoverTable = Option.none();
      
      mutation.events.drag.bind(function (event) {
        var column = Attr.get(event.target(), 'data-column');
        if (column !== undefined) {
          var current = parseInt(Css.get(event.target(), 'left'), 10);
          Css.set(event.target(), 'left', current + event.xDelta() + 'px');
        } else {
          var row = Attr.get(event.target(), 'data-row');
          var top = parseInt(Css.get(event.target(), 'top'), 10);
          Css.set(event.target(), 'top', top + event.yDelta() + 'px');
        }
      });

      resizing.events.stop.bind(function (event) {
        mutation.get().each(function (target) {
          console.log('target: ', target.dom());
          hoverTable.each(function (table) {
            console.log('table: ', table.dom());
            var column = Attr.get(target, 'data-column');
            if (column !== undefined) events.trigger.adjustWidth(table, target, parseInt(column, 10));
            else {
              var row = Attr.get(target, 'data-row');
              if (row !== undefined) events.trigger.adjustHeight(table, target, parseInt(row, 10));
            }
            Bars.refresh(container, table);
          });
        });
      });

      DomEvent.bind(container, 'mousedown', function (event) {
        var body = Element.fromDom(document.body);
        if (Bars.isVBar(event.target())) {
          var column = Attr.get(event.target(), 'data-column');
          mutation.assign(event.target());
          Attr.set(event.target(), 'data-initial-left', parseInt(Css.get(event.target(), 'left'), 10));
          Css.set(event.target(), 'opacity', 0.04);
          resizing.go(body);
        } else if (Bars.isHBar(event.target())) {
          var row = Attr.get(event.target(), 'data-row');
          mutation.assign(event.target());
          Attr.set(event.target(), 'data-initial-top', parseInt(Css.get(event.target(), 'top'), 10));
          Css.set(event.target(), 'opacity', 0.04);
          resizing.go(body);
        }
      });

      DomEvent.bind(container, 'mouseover', function (event) {
        if (Node.name(event.target()) === 'table' || SelectorExists.ancestor(event.target(), 'table')) {
          hoverTable = Node.name(event.target()) === 'table' ? Option.some(event.target()) : SelectorFind.ancestor(event.target(), 'table');
          Bars.refresh(container, hoverTable.getOrDie());
        }
      });

      DomEvent.bind(container, 'mouseout', function (event) {
        if (Node.name(event.target()) === 'table') {
          Bars.hide(container);
        }
      });

      /* This is required on Firefox to stop the default drag behaviour interfering with dragster */
      DomEvent.bind(container, 'dragstart', function (event) {
        event.raw().preventDefault();
      });

      var refresh = function (tbl) {
        Bars.refresh(container, tbl);
      };

      var events = Events.create({
        adjustWidth: Event(['table', 'bar', 'column']),
        adjustHeight: Event(['table', 'bar', 'row'])
      });

      return {
        destroy: Fun.identity,
        refresh: refresh,
        on: resizing.on,
        off: resizing.off,
        events: events.registry
      };
    };

  }
);
