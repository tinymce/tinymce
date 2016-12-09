define(
  'ephox.alloy.api.ui.FormChooser',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.events.EventSource',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr'
  ],

  function (SystemEvents, BehaviourExport, Highlighting, CompositeBuilder, EventHandler, Fields, DomModification, EventSource, PartType, ButtonBase, FieldSchema, Objects, Fun, Option, Attr) {
    var schema = [
      Fields.members([ 'choice' ]),
      FieldSchema.strict('choices'),

      Fields.markers([ 'choiceClass', 'selectedClass' ])
      // FieldSchema.strict('options'),
      // Fields.members([ 'option' ]),
      // FieldSchema.option('data')
    ];

    var partTypes = [
      PartType.internal(
        { build: Fun.identity },
        'legend',
        '<alloy.form-chooser.legend>',
        function (detail) {
          return {
            uiType: 'custom',
            dom: {
              tag: 'legend'
            }
          };
        },
        Fun.constant({ })
      ),

      PartType.group(
        { build: Fun.identity },
        'choices',
        'choice',
        '<alloy.form-chooser.choices>',
        Fun.constant({ }),
        function (detail, choiceSpec) {
          return {
            dom: {
              attributes: {
                role: 'radio'
              }
            },
            behaviours: {
              representing: {
                store: {
                  mode: 'memory',
                  initialValue: choiceSpec
                }
              },
              focusing: { },
              // TODO: Improving adding classes nicely with a behaviour.
              'choice.behaviour': { }
              
            },
            customBehaviours: [
              BehaviourExport.exhibitor('choice.behaviour', function (base, info) {
                return DomModification.nu({
                  classes: [ detail.markers().choiceClass() ]
                });
              })
            ],
            events: ButtonBase.events(Option.none())
          };
        }
      )
    ];

    var build = function (f) {
      return CompositeBuilder.build('form-chooser', schema, partTypes, make, f);
    };

    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: {
          keying: {
            mode: 'flow',
            selector: '.' + detail.markers().choiceClass(),
            executeOnMove: true,
            getInitial: function (chooser) {
              return Highlighting.getHighlighted(chooser).map(function (choice) {
                return choice.element();
              });
            },
            execute: function (chooser, simulatedEvent, focused) {
              return chooser.getSystem().getByDom(focused).map(function (choice) {
                Highlighting.highlight(chooser, choice);
                return true;
              });
            }
          },

          highlighting: {
            itemClass: detail.markers().choiceClass(),
            highlightClass: detail.markers().selectedClass(),
            onHighlight: function (chooser, choice) {
              Attr.set(choice.element(), 'aria-checked', 'true');
            },
            onDehighlight: function (chooser, choice) {
              Attr.set(choice.element(), 'aria-checked', 'false');
            }
          }
        },

        events: Objects.wrapAll([
          {
            key: SystemEvents.execute(),
            value: EventHandler.nu({
              run: function (chooser, simulatedEvent) {
                // TODO :Check this will always be present (button property)
                chooser.getSystem().getByDom(simulatedEvent.event().target()).each(function (choice) {
                  Highlighting.highlight(chooser, choice);
                });
              }
            })
          }

        ])
      };
    };

    var parts = PartType.generate('form-chooser', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);