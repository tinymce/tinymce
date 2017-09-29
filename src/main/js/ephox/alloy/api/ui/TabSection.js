define(
  'ephox.alloy.api.ui.TabSection',

  [
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.ui.schema.TabSectionSchema',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.properties.Attr'
  ],

  function (Highlighting, Replacing, Representing, SketchBehaviours, AlloyEvents, SystemEvents, Sketcher, AlloyParts, TabSectionSchema, Arr, Attr) {
    var factory = function (detail, components, spec, externals) {
      var changeTab = function (button) {
        var tabValue = Representing.getValue(button);
        AlloyParts.getPart(button, detail, 'tabview').each(function (tabview) {
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
        behaviours: SketchBehaviours.get(detail.tabSectionBehaviours()),

        events: AlloyEvents.derive(
          Arr.flatten([

            detail.selectFirst() ? [
              AlloyEvents.runOnAttached(function (section, simulatedEvent) {
                AlloyParts.getPart(section, detail, 'tabbar').each(function (tabbar) {
                  Highlighting.getFirst(tabbar).each(function (button) {
                    Highlighting.highlight(tabbar, button);
                    changeTab(button);
                  });
                });
              })
            ] : [ ],

            [
              AlloyEvents.run(SystemEvents.changeTab(), function (section, simulatedEvent) {
                var button = simulatedEvent.event().button();
                changeTab(button);
              }),
              AlloyEvents.run(SystemEvents.dismissTab(), function (section, simulatedEvent) {
                var button = simulatedEvent.event().button();
                detail.onDismissTab()(section, button);
              })
            ]
          ])
        )
      };

    };

    return Sketcher.composite({
      name: 'TabSection',
      configFields: TabSectionSchema.schema(),
      partFields: TabSectionSchema.parts(),
      factory: factory
    });
  }
);