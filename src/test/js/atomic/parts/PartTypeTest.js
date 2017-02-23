test(
  'Atomic Test: parts.PartTypeTest',

  [
    'ephox.alloy.parts.PartType',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun'
  ],

  function (PartType, Arr, Fun) {
    var internal = PartType.internal(
      { sketch: function (x) { return 'sketch.' + x; } },
      [ ],
      'alpha',
      '<part.alpha>',
      function () {
        return {
          value: 10
        };
      },
      function () {
        return {
          otherValue: 15
        };
      }
    );

    var schemas = PartType.schemas([ internal ]);
    console.log('schemas', Arr.map(schemas, function (s) {
      return s.fold(function (field, of, p, value) {
        return 'field: ' + field + ', value: ' + value.toString();
      }, function () {
        return 'state';
      });
    }));

    var placeholders = PartType.generate('part', [ internal ]);
    var components = PartType.components('part', {
      components: Fun.constant([
        placeholders.alpha()
      ]),
      parts: Fun.constant({
        alpha: Fun.constant({
          entirety: Fun.constant({})
        })
      }),
      partUids: Fun.constant({
        name: Fun.constant('name-uid')
      })
    }, [ internal ]);
  }
);
