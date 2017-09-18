define(
  'ephox.phoenix.demo.ReuseDemo',

  [
    'ephox.katamari.api.Arr',
    'ephox.phoenix.api.dom.DomWrapping',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Arr, DomWrapping, Css, DomEvent, Element, Insert, Node, SelectorFind) {
    return function () {
      var editor = Element.fromTag('div');
      Css.setAll(editor, {
        width: '400px',
        height: '300px',
        border: '1px solid blue'
      });
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      DomEvent.bind(Element.fromDom(document), 'keydown', function (event) {
        if (event.raw().keyCode === 13) {
          var selection = window.getSelection();
          if (selection.rangeCount > 0) {
            var spans = DomWrapping.reuse(Element.fromDom(selection.anchorNode), selection.anchorOffset, Element.fromDom(selection.focusNode), selection.focusOffset, function (elem) {
              return Node.name(elem) === 'span';
            }, function () {
              return DomWrapping.nu(Element.fromTag('span'));
            });

            Arr.each(spans, function (span) {
              Css.set(span, 'border-bottom', '1px solid red');
            });
          }
        }
      });

      Insert.append(ephoxUi, editor);

      editor.dom().innerHTML = 'Hello <span style="background-color: blue;">world</span> again<br/>, this is Earth.';

      
    };
  }
);
