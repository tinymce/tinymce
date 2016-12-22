define(
  'ephox.alloy.demo.DragnDropDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.behaviour.DragnDrop',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, DragnDrop, Button, HtmlDisplay, Objects, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var deriveCapabilities = function (caps) {
        return Objects.wrapAll(caps);
      };

      var display1 = HtmlDisplay.section(
        gui,
        'The button can be dragged into the the container',
        {
          uiType: 'container',
          components: [
            Button.build({
              dom: {
                tag: 'button',
                styles: {
                  'background-color': 'black',
                  width: '20px',
                  height: '20px'
                }
              },
              action: function () {
                console.log('*** Image ButtonDemo click ***');
              },

              behaviours: deriveCapabilities([
                DragnDrop.config({
                  mode: 'drag',
                  type: 'text/html'
                })
              ])
            }),

            {
              uiType: 'container',
              dom: {
                styles: {
                  background: 'red',
                  width: '100px',
                  height: '100px'
                }
              }
            }
          ]
        }        
      );
    };
  }
);
