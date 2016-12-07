define(
  'ephox.alloy.spec.ToolbarSpec',

  [
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.toolbar.Overflowing',
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result'
  ],

  function (Replacing, Fields, SpecSchema, UiSubstitutes, Overflowing, ToolbarSpecs, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Fun, Option, Result) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('initGroups'),

      FieldSchema.defaulted('shell', true),

      Fields.members([ 'group' ])
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('toolbar.spec', schema, spec, [
        'groups'
      ]);

       // FIX: I don't want to calculate this here.
      var overflowSpec = ValueSchema.asStructOrDie('overflow.spec', ValueSchema.objOf([
        Overflowing.schema()
      ]), spec);

      // var builder = overflowSpec.overflowing().map(function (oInfo) {
      //   return Fun.curry(oInfo.handler().builder, oInfo);
      // }).getOr(Fun.identity);

      var buildGroups = function (groups) {
        return Arr.map(groups, function (grp) {
          return Merger.deepMerge(
            detail.members().group().munge(grp),
            {
              uiType: 'toolbar-group'
            }
          );
        });
      };

      var components = detail.shell() ? buildGroups(detail.initGroups()) : UiSubstitutes.substitutePlaces(
        Option.some('toolbar'),
        detail,
        detail.components(),
        {
          '<alloy.toolbar.groups.container>': UiSubstitutes.single(true,  
            Merger.deepMerge(
              detail.parts().groups(),              
              {
                uiType: 'custom',
                uid: detail.partUids().groups,
                replacing: { },
                components: buildGroups(detail.initGroups())
              }
            )
          )
        }, 
        {
          
        }
      );

      var replacing = detail.shell() ? { } : undefined;

      var getGroupContainer = function (component) {
        return detail.shell() ? Result.value(component) : component.getSystem().getByUid(
          detail.partUids().groups
        );
      };

      var setGroupSpecs = function (component, gs) {
        getGroupContainer(component).each(function (container) {
          var newGroups = buildGroups(gs);
          Replacing.replace(container, newGroups);
        });
      };

      var setGroups = function (component, gs) {
        getGroupContainer(component).each(function (container) {
          Replacing.replace(container, gs);
        });
      };

      // Maybe default some arguments here
      return Merger.deepMerge(spec, {
        dom: detail.dom(),
        // keying: {
        //   mode: 'cyclic'
        // },
        behaviours: [
          Overflowing
        ],
        postprocess: overflowSpec.overflowing().map(function (oInfo) { return Fun.curry(oInfo.handler().postprocess, oInfo); }).getOr(Fun.identity)
      }, spec, {
        uiType: 'custom',
        components: components,
        apis: {
          setGroups: setGroups,
          setGroupSpecs: setGroupSpecs
        },
        replacing: replacing
      });
    };

    return {
      make: make
    };
  }
);