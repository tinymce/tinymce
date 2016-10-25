define(
  'ephox.alloy.spec.SandboxedSpec',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (Tagger, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, ValueSchema, Merger, Option) {
    var schema = [
      FieldSchema.field(
        'sink',
        'sink',
        FieldPresence.strict(),
        ValueSchema.choose(
          'type',
          {
            internal: [
              FieldSchema.strict('dom'),
              FieldSchema.option('uid'),
              FieldSchema.defaulted('useFixed', true),
              FieldSchema.state('instance', function () {
                return function (sinkInfo) {
                  var fallbackUid = Tagger.generate('');

                  var getSink = function (component) {
                    var uid = sinkInfo.uid().getOr(fallbackUid);
                    return component.getSystem().getByUid(uid).getOrDie();
                  };

                  var extra = function () {
                    var uid = sinkInfo.uid().getOr(fallbackUid);
                    return [
                      {
                        uiType: 'custom',
                        dom: sinkInfo.dom(),
                        uid: uid,
                        positioning: {
                          useFixed: sinkInfo.useFixed()
                        }
                      }
                    ];
                  };

                  return {
                    getSink: getSink,
                    extra: extra
                  };
                };
              })
            ],
            external: [
              FieldSchema.strict('sink'),
              FieldSchema.state('instance', function () {
                return function (sinkInfo) {
                  var getSink = function (component, sinkInfo) {
                    return sinkInfo.sink();
                  };

                  var extra = function (component) {
                    return [ ];
                  };
                };

                return {
                  getSink: getSink,
                  extra: extra
                };
              })
            ]
          }
        )        
      ),

      FieldSchema.strict('dom'),
      FieldSchema.strict('component')
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('sandboxed.component.spec', schema, spec);

      var components = UiSubstitutes.substitutePlaces(Option.some('sandboxed-component'), detail, detail.components(), {
        '<alloy.sandboxed.component>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.component(),
            {
              getSink: detail.sink().getSink(detail.sink())
            }
          )
        )
      });

      var allComponents = components.concat(sink.getExtra())

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        components: components
      };
    };

    return {
      make: make
    };
  }
);