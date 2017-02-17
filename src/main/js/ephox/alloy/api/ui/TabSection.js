define(
  'ephox.alloy.api.ui.TabSection',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.TabSectionSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Attr'
  ],

  function (
    EventRoot, Highlighting, Replacing, Representing, SystemEvents, UiSketcher, EventHandler,
    PartType, TabSectionSchema, Objects, Arr, Fun, Attr
  ) {
    var schema = TabSectionSchema.schema();
    var partTypes = TabSectionSchema.parts();

    var make = function (detail, components, spec, externals) {
      var changeTab = function (button) {
        var tabValue = Representing.getValue(button);
        button.getSystem().getByUid(detail.partUids().tabview).each(function (tabview) {
          var tabWithValue = Arr.find(detail.tabs(), function (t) {
            return t.value === tabValue;
          });

          tabWithValue.each(function (tabData) {
            var panel = tabData.view();

            // Update the tabview to refer to the current tab.
            Attr.set(tabview.element(), 'aria-labelledby', Attr.get(button.element(), 'id'));
            Replacing.set(tabview, panel);
            detail.onChangeTab()(tabview, button, panel);
          });
        });
      };

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,


        events: Objects.wrapAll([
          {
            key: SystemEvents.systemInit(),
            value: EventHandler.nu({
              run: function (section, simulatedEvent) {
                if (detail.selectFirst() && EventRoot.isSource(section, simulatedEvent)) {
                  section.getSystem().getByUid(detail.partUids().tabbar).each(function (tabbar) {
                    Highlighting.getFirst(tabbar).each(function (button) {
                      Highlighting.highlight(tabbar, button);
                      changeTab(button);
                    });
                  });
                }
              }
            })
          },

          {
            key: SystemEvents.changeTab(),
            value: EventHandler.nu({
              run: function (section, simulatedEvent) {
                var button = simulatedEvent.event().button();
                changeTab(button);
              }
            })
          },

          {
            key: SystemEvents.dismissTab(),
            value: EventHandler.nu({
              run: function (section, simulatedEvent) {
                var button = simulatedEvent.event().button();
                detail.onDismissTab()(section, button);
              }
            })
          }


        ])
      };

    };

    var sketch = function (spec) {
      return UiSketcher.composite(TabSectionSchema.name(), schema, partTypes, make, spec);
    };

    var parts = PartType.generate(TabSectionSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts)
    };
  }
);