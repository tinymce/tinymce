define(
  'tinymce.core.test.TypeText',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'global!document'
  ],
  function (GeneralSteps, Keyboard, Step, Arr, Fun, document) {
    var insertCharAtRange = function (rng, chr) {
      var outRng = rng.cloneRange();
      var sc = rng.startContainer, so = rng.startOffset;

      if (sc.nodeType === 3) {
        sc.insertData(so, chr);
        outRng.setStart(sc, so + 1);
        outRng.setEnd(sc, so + 1);
      } else {
        var textNode = document.createTextNode(chr);

        if (so === sc.childNodes.length) {
          sc.appendChild(textNode);
        } else {
          sc.insertBefore(textNode, sc.childNodes[so]);
        }

        outRng.setStart(textNode, 1);
        outRng.setEnd(textNode, 1);
      }

      return outRng;
    };

    var insertCharAtSelection = function (doc, chr) {
      var sel = doc.defaultView.getSelection();

      if (sel.rangeCount >= 1) {
        var rng = sel.getRangeAt(0);
        var newRange = insertCharAtRange(rng, chr);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } else {
        throw new Error('Can not type at an non existing range selection');
      }
    };

    var sInsertCharAtSelection = function (doc, chr) {
      return Step.sync(function () {
        insertCharAtSelection(doc.dom(), chr);
      });
    };

    var sTypeChar = function (doc, chr) {
      return GeneralSteps.sequence([
        Keyboard.sKeydown(doc, chr, {}),
        Keyboard.sKeypress(doc, chr, {}),
        sInsertCharAtSelection(doc, chr),
        Keyboard.sKeyup(doc, chr, {})
      ]);
    };

    var sTypeContentAtSelection = function (doc, text) {
      return GeneralSteps.sequence(Arr.map(text.split(''), Fun.curry(sTypeChar, doc)));
    };

    return {
      sTypeContentAtSelection: sTypeContentAtSelection
    };
  }
);