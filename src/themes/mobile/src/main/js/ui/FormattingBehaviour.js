define(
  'tinymce.themes.mobile.ui.FormattingBehaviour',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.boulder.api.FieldSchema',
    'tinymce.themes.mobile.ui.FormattingChanged'
  ],

  function (Behaviour, FieldSchema, FormattingChanged) {
    var schema = [
      FieldSchema.strict('update'),
      FieldSchema.strict('editor'),
      FieldSchema.strict('command')
    ];

    var active = {
      events: function (bInfo) {
        return FormattingChanged.onAttached(bInfo.editor(), bInfo.command(), bInfo.update());
      }
    };

    var apis = { };

    return Behaviour.create(
      schema,
      'tiny-formatting',
      active,
      apis
    );
  }
);
