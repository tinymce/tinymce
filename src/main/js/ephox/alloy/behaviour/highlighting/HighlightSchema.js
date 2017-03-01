define(
  'ephox.alloy.behaviour.highlighting.HighlightSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema'
  ],

  function (Fields, FieldSchema) {
    return [
      FieldSchema.strict('highlightClass'),
      FieldSchema.strict('itemClass'),

      Fields.onHandler('onHighlight'),
      Fields.onHandler('onDehighlight')
    ];
  }
);