define(
  'ephox.alloy.demo.OrderableDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.boulder.api.FieldSchema',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, BehaviourExport, HtmlDisplay, FieldSchema, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      HtmlDisplay.section(
        gui,
        'This container has orderable buttons',
        {
          uiType: 'container',





          behaviours: {
            ordering: {
              blah: 'hi'
            }
          },


          customBehaviours: [
            BehaviourExport.santa(
              [
                FieldSchema.strict('blah')
              ],
              'ordering',
              { },
              { },
              { }
            )
          ]
        }
      );
    };
  }
);