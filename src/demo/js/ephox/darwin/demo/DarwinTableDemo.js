define(
  'ephox.darwin.demo.DarwinTableDemo',

  [
    'ephox.darwin.api.InputHandlers',
    'ephox.darwin.api.SelectionDirection',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.WindowSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Direction',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Replication',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'global!Math',
    'global!document'
  ],

  function (InputHandlers, SelectionDirection, PlatformDetection, WindowSelection, Fun, Option, Attr, Body, Compare, Direction, DomEvent, Element, Insert, Node, Replication, SelectorFind, Traverse, Math, document) {
    return function () {

      var detection = PlatformDetection.detect();

      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
      Attr.set(ephoxUi, 'contenteditable', 'true');

      var style = Element.fromHtml(
        '<style>' +
          'table { border-collapse: collapse; }\n' +
          'td { text-align: left; border: 1px solid #aaa; font-size: 20px; }\n' +
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
              '<td style="min-width: 100px;" colspan=2>C1<br /><br /><br /></td>' +
              // '<td style="min-width: 100px;">D1</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="min-width: 100px;">A2</td>' +
              '<td style="min-width: 100px;">B2<br /><br /></td>' +
              '<td style="min-width: 100px;"><p>C2</p><p>More</p></td>' +
              '<td style="min-width: 100px;"><br />D2</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="min-width: 100px;">A3</td>' +
              '<td style="min-width: 100px;"><br /></td>' +
              '<td style="min-width: 100px;"><br /></td>' +
              '<td style="min-width: 100px;">D3</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="padding-top: 100px;" style="min-width: 100px;">A4</td>' +
              '<td style="padding-top: 100px;" style="min-width: 100px;"><br /></td>' +
              '<td style="padding-top: 100px;" style="min-width: 100px;"><br /></td>' +
              '<td style="padding-top: 100px;" style="min-width: 100px;">D4</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      Insert.append(ephoxUi, table);
      Insert.append(Element.fromDom(document.head), style);

      var rtlTable = Replication.deep(table);
      Attr.set(rtlTable, 'dir', 'rtl');
      Insert.append(ephoxUi, rtlTable);

      var cloneDiv = Element.fromTag('div');
      Attr.set(cloneDiv, 'contenteditable', 'true');
      var clone = Replication.deep(table);
      Insert.append(cloneDiv, clone);
      Insert.append(Body.body(), cloneDiv);

      Insert.append(Body.body(), Element.fromHtml('<span id="coords">(0, 0)</span>'));
      DomEvent.bind(Body.body(), 'mousemove', function (event) {
        document.querySelector('#coords').innerHTML = '(' + event.raw().clientX + ', ' + event.raw().clientY + ')';
      });

      var mouseHandlers = InputHandlers.mouse(window, ephoxUi);
      var keyHandlers = InputHandlers.keyboard(window, ephoxUi, Fun.curry(Compare.eq, table));

      DomEvent.bind(ephoxUi, 'mousedown', mouseHandlers.mousedown);
      DomEvent.bind(ephoxUi, 'mouseover', mouseHandlers.mouseover);
      DomEvent.bind(ephoxUi, 'mouseup', mouseHandlers.mouseup);

      var handleResponse = function (event, response) {
        if (response.kill()) event.kill();
        response.selection().each(function (ns) {
          WindowSelection.set(window, ns);
        });
      };

      DomEvent.bind(ephoxUi, 'keyup', function (event) {
        // Note, this is an optimisation.
        if (event.raw().shiftKey && event.raw().which >= 37 && event.raw().which <= 40) {
          WindowSelection.get(window).each(function (sel) {
            keyHandlers.keyup(event, sel.start(), sel.soffset(), sel.finish(), sel.foffset()).each(function (response) {
              handleResponse(event, response);
            });
          }, Fun.noop);
        }
      });

      DomEvent.bind(ephoxUi, 'keydown', function (event) {
        // This might get expensive.
        WindowSelection.get(window).each(function (sel) {
          var target = Node.isText(sel.start()) ? Traverse.parent(sel.start()) : Option.some(sel.start());
          var direction = target.map(Direction.getDirection).getOr('ltr');
          keyHandlers.keydown(event, sel.finish(), sel.foffset(), direction === 'ltr' ? SelectionDirection.ltr : SelectionDirection.rtl).each(function (response) {
            handleResponse(event, response);
          });
        });
      });
    };
  }
);