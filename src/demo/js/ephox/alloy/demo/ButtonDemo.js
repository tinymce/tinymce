define(
  'ephox.alloy.demo.ButtonDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.behaviour.CustomBehaviour',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, GuiFactory, CustomBehaviour, HtmlDisplay, DomModification, ValueSchema, Fun, Class, Css, Element, Html, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var button1 = HtmlDisplay.section(
        gui,
        'This button has two custom behaviours. One adds (among other things) "data-cat" and ' +
        'background blue, and the other adds color red',
        {
          uiType: 'button',
          action: function () {
            console.log('***button.click');
          },
          text: 'Click me',
          toggling: {
            toggleClass: 'demo-selected'
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
                    color: 'red'
                  }
                });
              }
            })
          ],
          blah: true,
          'blah2': true
        }
      );
    };
  }
);

