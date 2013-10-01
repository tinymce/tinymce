define(
  'ephox.robin.demo.WordSelectDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.peanut.Fun',
    'ephox.robin.api.dom.DomSmartSelect',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind'
  ],

  function ($, Fun, DomSmartSelect, Attr, Css, DomEvent, Element, Insert, SelectorFind) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var editor = Element.fromTag('div');
      Attr.set(editor, 'contenteditable', 'true');
      Css.setAll(editor, {
        width: '500px',
        height: '400px',
        border: '1px solid black'
      });

      Insert.append(editor, Element.fromText('This is something to start with'));

      Insert.append(ephoxUi, editor);

      var select = function (s, so, f, fo) {
        var selection = window.getSelection();
        selection.removeAllRanges();
        var range = document.createRange();
        range.setStart(s.dom(), so);
        range.setEnd(f.dom(), fo);
        console.log('setting range: ', s.dom(), so, f.dom(), fo);
        selection.addRange(range);
      };

      var getSelect = function () {
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
          var range = selection.getRangeAt(0);
          console.log('range: ', range);
          return {
            startContainer: Fun.constant(Element.fromDom(range.startContainer)),
            startOffset: Fun.constant(range.startOffset),
            endContainer: Fun.constant(Element.fromDom(range.endContainer)),
            endOffset: Fun.constant(range.endOffset)
          };
        } else {
          return null;
        }
      };

      DomEvent.bind(editor, 'click', function (event) {
        var current = getSelect();
        var wordRange = DomSmartSelect.word(current.startContainer(), current.startOffset());
        if (current !== null) select(wordRange.startContainer(), wordRange.startOffset(), wordRange.endContainer(), wordRange.endOffset());
      });
    };
  }
);
