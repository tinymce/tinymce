define(
  'ephox.alloy.behaviour.highlighting.HighlightSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, Fun) {
    return [
      FieldSchema.strict('highlightClass'),
      FieldSchema.strict('itemClass'),

      FieldSchema.defaulted('onHighlight', Fun.noop),
      FieldSchema.defaulted('onDehighlight', Fun.noop)
    ];
  }
);