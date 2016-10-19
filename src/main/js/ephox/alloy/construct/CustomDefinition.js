define(
  'ephox.alloy.construct.CustomDefinition',

  [
    'ephox.alloy.behaviour.Coupling',
    'ephox.alloy.behaviour.Disabling',
    'ephox.alloy.behaviour.Focusing',
    'ephox.alloy.behaviour.Highlighting',
    'ephox.alloy.behaviour.Invalidating',
    'ephox.alloy.behaviour.Keying',
    'ephox.alloy.behaviour.Positioning',
    'ephox.alloy.behaviour.Receiving',
    'ephox.alloy.behaviour.Redesigning',
    'ephox.alloy.behaviour.Replacing',
    'ephox.alloy.behaviour.Representing',
    'ephox.alloy.behaviour.Sandboxing',
    'ephox.alloy.behaviour.Sliding',
    'ephox.alloy.behaviour.Streaming',
    'ephox.alloy.behaviour.Tabstopping',
    'ephox.alloy.behaviour.Toggling',
    'ephox.alloy.behaviour.Transitioning',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.ephemera.AlloyTags',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Node',
    'global!Error'
  ],

  function (Coupling, Disabling, Focusing, Highlighting, Invalidating, Keying, Positioning, Receiving, Redesigning, Replacing, Representing, Sandboxing, Sliding, Streaming, Tabstopping, Toggling, Transitioning, DomDefinition, AlloyTags, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Element, Node, Error) {
    var domSchema = ValueSchema.objOf([
      FieldSchema.strict('tag'),
      FieldSchema.defaulted('styles', {}),
      FieldSchema.defaulted('classes', []),
      FieldSchema.defaulted('attributes', {}),
      FieldSchema.field('value', 'value', FieldPresence.asOption(), ValueSchema.anyValue()),
      FieldSchema.field('innerHtml', 'innerHtml', FieldPresence.asOption(), ValueSchema.anyValue())
      // Note, no children.
    ]);

    var ripoff = function (template) {
      var elem = Element.fromHtml(template.html);
      console.log('elem', elem.dom());

      // FIX: Sugarify
      var attrs = Arr.foldl(elem.dom().attributes, function (b, attr) {
        return Merger.deepMerge(b, Objects.wrap(attr.name, attr.value));
      }, {});

      var styles = Arr.foldl(elem.dom().style, function (b, st) {
        return Merger.deepMerge(b, Objects.wrap(st, elem.dom().style[st]));
      }, {});

      return {
        dom: {
          tag: Node.name(elem),
          attributes: attrs,
          styles: styles
        }
      };
    };


    var toInfo = function (rawSpec) {
      console.log('rawSpec', rawSpec);
      if (rawSpec.dom !== undefined && rawSpec.template !== undefined) throw new Error('Cannot specify both config DOM and template DOM');
      var spec = rawSpec.dom !== undefined ? rawSpec : Merger.deepMerge(ripoff(rawSpec.template), rawSpec);
      var behaviours = Objects.readOr('behaviours', [])(spec);
      var behaviourSchema = Arr.map(alloyBehaviours.concat(behaviours), function (b) {
        return b.schema();
      });

      return ValueSchema.asStruct('custom.definition', ValueSchema.objOf([
        FieldSchema.field('dom', 'dom', FieldPresence.strict(), domSchema),
        FieldSchema.strict('components'),
        FieldSchema.option('uid'),
        FieldSchema.defaulted('behaviours', [ ]),

        // TODO: Add behaviours here.
        //

        FieldSchema.defaulted('events', {}),
        FieldSchema.defaulted('apis', Fun.constant({})),

        // Use mergeWith in the future when pre-built behaviours conflict
        FieldSchema.defaulted('apiOrder', {}),
        FieldSchema.field(
          'eventOrder',
          'eventOrder',
          FieldPresence.mergeWith({
            'alloy.execute': [ 'disabling', 'alloy.base.behaviour', 'toggling' ],
            'alloy.focus': [ 'alloy.base.behaviour', 'keying', 'focusing' ]
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
        )
      ].concat(behaviourSchema)), spec);
    };

    var getUid = function (info) {
      return info.uid().fold(function () {
        return { };
      }, function (uid) {
        return Objects.wrap(AlloyTags.idAttr(), uid);
      });
    };

    var toDefinition = function (info) {
      var base = {
        tag: info.dom().tag(),
        classes: info.dom().classes(),
        attributes: Merger.deepMerge(
          getUid(info),
          { role: 'presentation' },
          info.dom().attributes()
        ),
        styles: info.dom().styles(),
        domChildren: Arr.map(info.components(), function (comp) { return comp.element(); })
      };

      return DomDefinition.nu(Merger.deepMerge(base, 
        info.dom().innerHtml().map(function (h) { return Objects.wrap('innerHtml', h); }).getOr({ }),
        info.dom().value().map(function (h) { return Objects.wrap('value', h); }).getOr({ })
      ));
    };

    var alloyBehaviours = [
      Toggling,
      Keying,
      Tabstopping,
      Focusing,
      Receiving,
      Coupling,
      Streaming,
      Positioning,
      Highlighting,
      Sandboxing,
      Redesigning,
      Disabling,
      Invalidating,
      Replacing,
      Representing,
      Sliding,
      Transitioning
    ];

    var behaviours = function (info) {
      // TODO: Check if behaviours are duplicated? Lab used to ...
      var bs = info.behaviours();
      return alloyBehaviours.concat(bs);
    };

    // Probably want to pass info to these at some point.
    var toApis = function (info) {
      return info.apis();
    };

    var toEvents = function (info) {
      return info.events();
    };

    return {
      toInfo: toInfo,
      toDefinition: toDefinition,
      behaviours: behaviours,
      toApis: toApis,
      toEvents: toEvents
    };
  }
);