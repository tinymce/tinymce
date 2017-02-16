test(
  'Atomic Test: parts.PartTypeTest',

  [
    'ephox.alloy.parts.PartType',
    'ephox.peanut.Fun'
  ],

  function (PartType, Fun) {
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
