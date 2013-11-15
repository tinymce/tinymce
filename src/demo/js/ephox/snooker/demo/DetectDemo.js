define(
  'ephox.snooker.demo.DetectDemo',

  [
    'ephox.compass.Arr',
    'ephox.dragster.api.Dragger',
    'ephox.perhaps.Option',
    'ephox.snooker.activate.Water',
    'ephox.snooker.croc.CellLookup',
    'ephox.snooker.croc.Spanning',
    'ephox.snooker.tbio.Aq',
    'ephox.snooker.tbio.TableOperation',
    'ephox.snooker.tbio.Yeco',
    'ephox.snooker.tbio.query.Lookup',
    'ephox.snooker.tbio.resize.bar.Bars',
    'ephox.snooker.tbio.resize.common.TargetMutation',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Ready',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Dragger, Option, Water, CellLookup, Spanning, Aq, TableOperation, Yeco, Lookup, Bars, TargetMutation, Attr, Css, DomEvent, Element, Insert, Node, Ready, SelectorExists, SelectorFilter, SelectorFind) {
    return function () {
      var subject = Element.fromHtml(
        '<table contenteditable="true" style="border-collapse: collapse;"><tbody>' +
          '<tr>' +
            '<td style="width: 110px;">1</td>' +
            '<td colspan="5">.</td>' +
          '</tr>' +
          '<tr>' +
            '<td colspan=2>.</td>' +
            '<td style="width: 130px;">3</td>' +
            '<td colspan=2>.</td>' +
            '<td style="width: 160px;">6</td>' +
          '</tr>' +
          '<tr>' +
            '<td colspan=3>.</td>' +
            '<td style="width: 140px;">4</td>' +
            '<td colspan=2>.</td>' +
          '</tr>' +
          '<tr>' +
            '<td colspan=4>.</td>' +
            '<td colspan=2>.</td>' +
          '</tr>' +
          '<tr>' +
            '<td>x</td>' +
            '<td style="width: 120px;">2</td>' +
            '<td colspan=2>.</td>' +
            '<td style="width: 150px;">5</td>' +
            '<td>x</td>' +
          '</tr>' +
        '</tbody></table>'
      );


      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
      Insert.append(ephoxUi, subject);


      var rows = SelectorFilter.descendants(subject, 'tr');
      var input = Lookup.information(subject);

      var model = CellLookup.model(input);
      var widths = Lookup.widths(input);

      console.log('widths: ', widths);

      var setTheWidths = Aq.aq(input, widths);
      Arr.each(setTheWidths, function (x) {
        console.log('haha', x.width());
        Css.set(x.id(), 'width', x.width());
      });

      DomEvent.bind(subject, 'mousemove', function (event) {
        if (Node.name(event.target()) === 'td') return;
        console.log(event.target().dom());
      });

      var mutation = TargetMutation();
      var resizing = Dragger.transform(mutation, {});
      resizing.on();

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

      var adjustWidths = function (target, column) {
        var old = Attr.get(target, 'data-initial-left');
        var current = parseInt(Css.get(target, 'left'), 10);
        var delta = current - old;

        var information = Lookup.information(subject);
        var ws = Lookup.widths(information);

        var numbers = Arr.map(ws, function (x) {
          return parseInt(x, 10);
        });

        var adjustments = Water.water(numbers, column, delta, 10);
        var withAdjustment = Arr.map(adjustments, function (a, i) {
          return a + numbers[i];
        });

        var newValues = Aq.aq(information, withAdjustment);
        Arr.each(newValues, function (v) {
          Css.set(v.id(), 'width', v.width() + 'px');
        });

        Attr.remove(target, 'data-initial-left');

      };

      // Dupe city.
      var adjustHeights = function (target, row) {
        var old = Attr.get(target, 'data-initial-top');
        var current = parseInt(Css.get(target, 'top'), 10);
        var delta = current - old;

        var information = Lookup.information(subject);
        var hs = Lookup.heights(information);
        console.log('hs: ', hs);

        var numbers = Arr.map(hs, function (x) {
          return parseInt(x, 10);
        });

        var adjustments = Water.water(numbers, row, delta, 10);
        var withAdjustment = Arr.map(adjustments, function (a, i) {
          return a + numbers[i];
        });

        var newValues = Aq.qwe(information, withAdjustment);
        Arr.each(newValues, function (v) {
          Css.set(v.id(), 'height', v.height() + 'px');
        });

        Attr.remove(target, 'data-initial-top');
      };

      resizing.events.stop.bind(function (event) {
        mutation.get().each(function (target) {
          var column = Attr.get(target, 'data-column');
          if (column !== undefined) adjustWidths(target, parseInt(column, 10));
          else {
            var row = Attr.get(target, 'data-row');
            if (row !== undefined) adjustHeights(target, parseInt(row, 10));
          }
          Bars.refresh(ephoxUi, subject);
        });
      });

      DomEvent.bind(ephoxUi, 'mousedown', function (event) {
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

      DomEvent.bind(ephoxUi, 'mouseover', function (event) {
        if (Node.name(event.target()) === 'table' || SelectorExists.ancestor(event.target(), 'table')) {
          Bars.show(ephoxUi);
        }
      });

      DomEvent.bind(ephoxUi, 'mouseout', function (event) {
        if (Node.name(event.target()) === 'table') {
          Bars.hide(ephoxUi);
        }
      });

      /* This is required on Firefox to stop the default drag behaviour interfering with dragster */
      DomEvent.bind(ephoxUi, 'dragstart', function (event) {
        event.raw().preventDefault();
      });

      Bars.refresh(ephoxUi, subject);

      // For firefox.
      Ready.execute(function () {
        // document.execCommand("enableInlineTableEditing", null, false);
        // document.execCommand("enableObjectResizing", false, "false");
      });


      var afterButton = Element.fromTag('button');
      Insert.append(afterButton, Element.fromText('>>'));
      Insert.append(ephoxUi, afterButton);

      var beforeButton = Element.fromTag('button');
      Insert.append(beforeButton, Element.fromText('<<'));
      Insert.append(ephoxUi, beforeButton);

      var deleteButton = Element.fromTag('button');
      Insert.append(deleteButton, Element.fromText('X'));
      Insert.append(ephoxUi, deleteButton);

      var detection = function () {
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
          var range = selection.getRangeAt(0);
          var start = Element.fromDom(range.startContainer);
          return Arr.contains([ 'td', 'th' ], Node.name(start)) ? Option.some(start) : SelectorFind.ancestor(start, 'th,td');
        } else {
          return Option.none();
        }
      };

      var newCell = function (prev) {
        var td = Element.fromTag('td');
        if (prev.colspan() === 1) Css.set(td, 'width', Css.get(prev.id(), 'width'));
        if (prev.rowspan() === 1) Css.set(td, 'height', Css.get(prev.id(), 'height'));
        return Spanning(td, 1, 1);
      };

      DomEvent.bind(afterButton, 'click', function (event) {
        detection().each(function (cell) {
          TableOperation.run(ephoxUi, subject, cell, function (information, gridpos) {
            return Yeco.insertAfter(information, gridpos.column(), gridpos.row(), newCell);
          });
        });
      });

      DomEvent.bind(beforeButton, 'click', function (event) {
        detection().each(function (cell) {
          TableOperation.run(ephoxUi, subject, cell, function (information, gridpos) {
            return Yeco.insertBefore(information, gridpos.column(), gridpos.row(), newCell);
          });
        });
      });

      DomEvent.bind(deleteButton, 'click', function (event) {
        detection().each(function (cell) {
          TableOperation.run(ephoxUi, subject, cell, function (information, gridpos) {
            return Yeco.erase(information, gridpos.column(), gridpos.row());
          });
        });
      });
    };
  }
);
