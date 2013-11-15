define(
  'ephox.snooker.demo.DetectDemo',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.snooker.croc.Spanning',
    'ephox.snooker.tbio.TableOperation',
    'ephox.snooker.tbio.Yeco',
    'ephox.snooker.tbio.resize.Adjustments',
    'ephox.snooker.tbio.resize.bar.BarManager',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Ready',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Option, Spanning, TableOperation, Yeco, Adjustments, BarManager, Css, DomEvent, Element, Insert, Node, Ready, SelectorFind) {
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

      var manager = BarManager(ephoxUi);
      manager.events.adjustWidth.bind(function (event) {
        console.log('adjusting width');
        Adjustments.adjustWidths(event.table(), event.bar(), event.column());
      });
      manager.events.adjustHeight.bind(function (event) {
        Adjustments.adjustHeights(event.table(), event.bar(), event.row());
      });
      manager.on();

      // manager.refresh(subject);

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
