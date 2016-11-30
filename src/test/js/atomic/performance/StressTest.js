test(
  'StressTest',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.lumber.api.Timers',
    'ephox.peanut.Fun'
  ],

  function (FieldPresence, FieldSchema, ValueSchema, Timers, Fun) {
    var domSchema = ValueSchema.objOf([
      FieldSchema.strict('tag'),
      FieldSchema.defaulted('styles', {}),
      FieldSchema.defaulted('classes', []),
      FieldSchema.defaulted('attributes', {}),
      FieldSchema.field('value', 'value', FieldPresence.asOption(), ValueSchema.anyValue()),
      FieldSchema.field('innerHtml', 'innerHtml', FieldPresence.asOption(), ValueSchema.anyValue())
      // Note, no children.
    ]);

    var schema = [
      FieldSchema.field('dom', 'dom', FieldPresence.strict(), domSchema),
      FieldSchema.strict('components'),
      FieldSchema.strict('uid'),
      FieldSchema.defaulted('behaviours', [ ]),

      // // TODO: Add behaviours here.
      // //

      FieldSchema.defaulted('events', {}),
      FieldSchema.defaulted('apis', Fun.constant({})),

      // Use mergeWith in the future when pre-built behaviours conflict
      FieldSchema.defaulted('apiOrder', {}),
      FieldSchema.field(
        'eventOrder',
        'eventOrder',
        FieldPresence.mergeWith({
          'alloy.execute': [ 'disabling', 'alloy.base.behaviour', 'toggling' ],
          'alloy.focus': [ 'alloy.base.behaviour', 'keying', 'focusing' ],
          'alloy.system.init': [ 'alloy.base.behaviour', 'disabling', 'toggling' ]
        }),
        ValueSchema.anyValue()
      ),
      FieldSchema.defaulted('domModificationOrder', {}),

      FieldSchema.state('definition.input', Fun.identity),
      FieldSchema.defaulted('postprocess', Fun.noop),

      // Could wrap this up in a behaviour ...but won't for the time being
      FieldSchema.field(
        'delegate',
        'delegate',
        FieldPresence.asOption(),
        ValueSchema.objOf([
          FieldSchema.strict('get')
        ])
      ),
      FieldSchema.state('originalSpec', Fun.identity)
    ];

    Timers.run('StressTest.asStructOrDie', function () {
      for (var i = 0; i < 10000; i++) {      
        ValueSchema.asStructOrDie('custom.definition', ValueSchema.objOf(schema), {
          dom: {
            tag: 'div'
          },
          events: {
            'alloy.focus': {
              abort: function () { },
              can: function () { },
              run: function () { }
            }
          },
          components: [ ],
          uid: 'uid_80260789111480471298204' + i,
          uiType: 'custom'
        });
      }
    });

    Timers.log();
  }
);