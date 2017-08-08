define(
  'tinymce.themes.mobile.api.MobileSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'global!window'
  ],

  function (FieldSchema, ValueSchema, Fun, Element, Traverse, window) {
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

        FieldSchema.defaulted('onTouchContent', Fun.noop),
        FieldSchema.defaulted('onTapContent', Fun.noop),
        FieldSchema.defaulted('onTouchToolstrip', Fun.noop),


        FieldSchema.defaulted('onScrollToCursor', Fun.constant({ unbind: Fun.noop })),
        FieldSchema.defaulted('onScrollToElement', Fun.constant({ unbind: Fun.noop })),
        FieldSchema.defaulted('onToEditing', Fun.constant({ unbind: Fun.noop })),
        FieldSchema.defaulted('onToReading', Fun.constant({ unbind: Fun.noop })),
        FieldSchema.defaulted('onToolbarScrollStart', Fun.identity)
      ]),

      FieldSchema.strict('socket'),
      FieldSchema.strict('toolstrip'),
      FieldSchema.strict('dropup'),
      FieldSchema.strict('toolbar'),
      FieldSchema.strict('container'),
      FieldSchema.strict('alloy'),
      FieldSchema.state('win', function (spec) {
        return Traverse.owner(spec.socket).dom().defaultView;
      }),
      FieldSchema.state('body', function (spec) {
        return Element.fromDom(
          spec.socket.dom().ownerDocument.body
        );
      }),
      FieldSchema.defaulted('translate', Fun.identity),
      FieldSchema.defaulted('setReadOnly', Fun.noop)
    ]);
  }
);
