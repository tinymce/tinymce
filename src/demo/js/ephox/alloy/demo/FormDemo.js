define(
  'ephox.alloy.demo.FormDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, HtmlDisplay, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      HtmlDisplay.section(
        gui,
        'This form has many fields',
        {
          uiType: 'form',
          dom: {
            tag: 'div'
          },
          components: [
            { uiType: 'placeholder', name: '<alloy.form.fields>', owner: 'form' }
          ],
          members: {
            ui: {
              munge: function (spec) {
                return spec;
              }
            }
          },
          uis: [
            { type: 'text-input' },
            { type: 'text-input' },
            { type: 'text-input' },
            { type: 'text-input' }
          ],
          keying: {
            mode: 'cyclic'
          }
        }
      );
    };
  }
);