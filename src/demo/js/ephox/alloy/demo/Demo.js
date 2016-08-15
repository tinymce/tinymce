define(
  'ephox.alloy.demo.Demo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.behaviour.CustomBehaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, GuiFactory, CustomBehaviour, DomModification, FieldSchema, ValueSchema, Fun, Class, Element, Insert, document) {
    return function () {
      console.log('Loading demo');

      var gui = Gui.create();
      var doc = Element.fromDom(document);
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var button = GuiFactory.build({
        uiType: 'button',
        action: function () {
          console.log('***button.click');
        },
        text: 'Click me',
        'toggling': true,
        eventOrder: {
          'alloy.execute': [ 'alloy.base.behaviour', 'toggling' ]
        },
        behaviours: [
          CustomBehaviour('blah', {
            schema: Fun.constant(ValueSchema.anyValue()),
            exhibit: function (info, base) {
              return DomModification.nu({
                classes: [ 'cat' ],
                attributes: {
                  'data-cat': 'cat'
                },
                styles: {
                  background: 'blue'
                },
                value: 10
              });
            }
          }),

          CustomBehaviour('blah2', {
            schema: Fun.constant(ValueSchema.anyValue()),
            exhibit: function (info, base) {
              return DomModification.nu({
                classes: [ 'cat' ],
                attributes: {
                  
                },
                styles: {
                  background: 'red'
                  // background: 'red'
                },
                // value: 15
              });
            }
          })
        ],
        blah: true,
        'blah2': true
      });

      gui.add(button);


    };
  }
);

