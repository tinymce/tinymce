define(
  'ephox.darwin.demo.DarwinTableDemo',

  [
    'ephox.darwin.api.Dogged',
    'ephox.darwin.api.TableMouse',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.WindowSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Replication',
    'ephox.sugar.api.SelectorFind',
    'global!Math',
    'global!document'
  ],

  function (Dogged, TableMouse, PlatformDetection, WindowSelection, Fun, Option, Attr, Body, DomEvent, Element, Insert, Replication, SelectorFind, Math, document) {
    return function () {

      var detection = PlatformDetection.detect();

      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
      Attr.set(ephoxUi, 'contenteditable', 'true');

      var style = Element.fromHtml(
        '<style>' +
          'table { border-collapse: collapse; }\n' +
          'td { text-align: center; border: 1px solid #aaa; font-size: 20px; padding: 10px; }\n' +
          'td.ephox-darwin-selected { background: #cadbee; }\n' +
          '#coords { position: fixed; right: 0px; bottom: 0px; background: #ddd }' +
        '</style>'
      );

      var table = Element.fromHtml(
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td style="min-width: 100px;">A1</td>' +
              '<td style="min-width: 100px;">B1<br /></td>' +
              '<td style="min-width: 100px;">C1<br /><br /><br /></td>' +
              '<td style="min-width: 100px;">D1</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="min-width: 100px;">A2</td>' +
              '<td style="min-width: 100px;">B2<br /><br /></td>' +
              '<td style="min-width: 100px;"><p>C2</p><p>More</p></td>' +
              '<td style="min-width: 100px;"><br />D2</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="min-width: 100px;">A3</td>' +
              '<td style="min-width: 100px;">B3</td>' +
              '<td style="min-width: 100px;">C3</td>' +
              '<td style="min-width: 100px;">D3</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      Insert.append(ephoxUi, table);
      Insert.append(Element.fromDom(document.head), style);

      var cloneDiv = Element.fromTag('div');
      Attr.set(cloneDiv, 'contenteditable', 'true');
      var clone = Replication.deep(table);
      Insert.append(cloneDiv, clone);
      Insert.append(Body.body(), cloneDiv);

      Insert.append(Body.body(), Element.fromHtml('<span id="coords">(0, 0)</span>'));
      DomEvent.bind(Body.body(), 'mousemove', function (event) {
        document.querySelector('#coords').innerHTML = '(' + event.raw().clientX + ', ' + event.raw().clientY + ')';
      });

      var handlers = TableMouse(ephoxUi);

      DomEvent.bind(ephoxUi, 'mousedown', handlers.mousedown);
      DomEvent.bind(ephoxUi, 'mouseover', handlers.mouseover);
      DomEvent.bind(ephoxUi, 'mouseup', handlers.mouseup);

      var handleResponse = function (event, response) {
        if (response.kill()) event.kill();
        response.selection().each(function (ns) {
          WindowSelection.set(window, ns);
        });
      };

      DomEvent.bind(ephoxUi, 'keyup', function (event) {
        if (event.raw().shiftKey && event.raw().which >= 37 && event.raw().which <= 40) {
          WindowSelection.get(window).each(function (sel) {
            Dogged.releaseShift(window, ephoxUi, Fun.constant(false), sel.start(), sel.soffset(), sel.finish(), sel.foffset()).each(function (response) {
              handleResponse(event, response);
            });
          }, Fun.noop);
        }
      });

      DomEvent.bind(ephoxUi, 'keydown', function (event) {
        // This might get expensive.
        WindowSelection.get(window).each(function (sel) {
          var handler = (function () {
            var keycode = event.raw().which;
            var shiftKey = event.raw().shiftKey === true;
            if (keycode === 40 && shiftKey) return Dogged.shiftDown;
            else if (keycode === 38 && shiftKey) return Dogged.shiftUp;
            else if (keycode === 37 && shiftKey) return Dogged.shiftLeft;
            else if (keycode === 39 && shiftKey) return Dogged.shiftRight;
            else if (keycode === 40) return Dogged.down;
            else if (keycode === 38) return Dogged.up;
            else if (keycode === 37) return Dogged.left;
            else if (keycode === 39) return Dogged.right;
            else return Option.none;
          })();

          handler(window, ephoxUi, Fun.constant(false), sel.finish(), sel.foffset()).each(function (response) {
            handleResponse(event, response);
          });
        });
      });
    };
  }
);