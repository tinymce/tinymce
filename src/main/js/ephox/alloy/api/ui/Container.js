define(
  'ephox.alloy.api.ui.Container',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.schema.ContainerSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (UiSketcher, ContainerSchema, Fun, Merger) {
    var make = function (detail, spec) {
      return {
        uid: detail.uid(),
        dom: Merger.deepMerge(
          {
            tag: 'div',
            attributes: {
              role: 'presentation'
            }
          },
          detail.dom()
        ),
        components: detail.components(),
        behaviours: detail.containerBehaviours(),
        events: detail.events(),
        domModification: detail.domModification(),
        customBehaviours: detail.customBehaviours(),
        eventOrder: detail.eventOrder()
      };
    };

    var sketch = function (spec) {
      return UiSketcher.single(ContainerSchema.name(), ContainerSchema.schema(), make, spec);
    };

    return {
      sketch: sketch,
      schemas: Fun.constant(ContainerSchema)
    };
  }
);