define(
  'tinymce.themes.mobile.api.MobileSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, ValueSchema, Fun) {
    return ValueSchema.objOf([
      FieldSchema.strictObjOf('editor', [
        // Maybe have frame as a method, but I doubt it ... I think we pretty much need a frame
        FieldSchema.strict('getFrame'),
        FieldSchema.option('getBody'),
        FieldSchema.option('getDoc'),
        FieldSchema.option('getWin'),
        FieldSchema.option('getSelection'),
        FieldSchema.option('setSelection'),
        FieldSchema.option('clearSelection'),

        FieldSchema.option('cursorSaver'),

        FieldSchema.option('onKeyup'),
        FieldSchema.option('onNodeChanged'),
        FieldSchema.option('getCursorBox'),

        FieldSchema.strict('onDomChanged'),


        FieldSchema.defaulted('onScrollToCursor', function () { return { unbind: Fun.noop }; }),
        FieldSchema.defaulted('onScrollToElement', function () { return { unbind: Fun.noop }; }),
        FieldSchema.defaulted('onToEditing', function () { return { unbind: Fun.noop }; }),
        FieldSchema.defaulted('onToReading', function () { return { unbind: Fun.noop }; }),

        FieldSchema.defaulted('onToolbarScrollStart', Fun.identity)
      ]),

      FieldSchema.strict('socket'),
      FieldSchema.strict('toolstrip'),
      FieldSchema.strict('toolbar'),
      FieldSchema.strict('container')
    ]);
  }
);
