test(
  'DomModificationTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.test.ResultAssertions'
  ],

  function (RawAssertions, DomModification, ResultAssertions) {
    var checkVal = function (label, expected, inputs) {
      ResultAssertions.checkVal(
        label,
        function () {
          return DomModification.combine(inputs);
        }, function (actual) {
          RawAssertions.assertEq(label, expected, DomModification.modToRaw(actual));
        }
      );
    };

    checkVal('Empty modification test', {
      classes: '<none>',
      attributes: '<none>',
      styles: '<none>',
      value: '<none>',
      innerHtml: '<none>',
      defChildren: '<none>',
      domChildren: '<none>'
    }, [
      DomModification.nu({

      })
    ]);
  }
);

// classes just expand
// attributes can clash
// styles can clash
// value always clashes with value
// innerHtml always clashes with innerHtml, defChildren, and domChildren
// defChildren always clashes with innerHtml, defChildren and domChildren
// domChildren always clashes with innerHtml, defChildren and domChildren


// var nu = Struct.immutableBag([ ], [
//       'classes',
//       'attributes',
//       'styles',
//       'value',
//       'innerHtml',
//       'defChildren',
//       'domChildren'
//     ]);