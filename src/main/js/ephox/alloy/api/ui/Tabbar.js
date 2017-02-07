define(
  'ephox.alloy.api.ui.Tabbar',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.TabButton',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.TabbarSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, Highlighting, SystemEvents, TabButton, UiBuilder, Fields, DomModification, PartType, TabbarSchema, FieldSchema, Fun) {
    var schema = TabbarSchema.schema();
    var partTypes = TabbarSchema.parts();

    var make = function (detail, components, spec, externals) {
      return {
        dom: {
          tag: 'div',
          attributes: {
            role: 'tablist'
          }
        },
        components: components,

        behaviours: {
          highlighting: {
            highlightClass: detail.markers().selectedClass(),
            itemClass: detail.markers().tabClass()
          },

          keying: {
            mode: 'flow',
            getInitial: function (tabbar) {
              // Restore focus to the previously highlighted tab.
              return Highlighting.getHighlighted(tabbar).map(function (tab) {
                return tab.element();
              });
            },
            selector: '.' + detail.markers().tabClass(),
            executeOnMove: true
          }
        }
      };
    };


    var build = function (spec) {
      return UiBuilder.composite(TabbarSchema.name(), schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(TabbarSchema.name(), partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)


    };
  }
);