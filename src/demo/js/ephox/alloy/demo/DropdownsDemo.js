define(
  'ephox.alloy.demo.DropdownsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, GuiFactory, HtmlDisplay, Future, Class, DomEvent, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        positioning: {
          useFixed: true
        }
      });

      gui.add(sink);      

      var onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
        gui.broadcastOn([ 'dismiss.popups' ], {
          target: evt.target()
        });
      });

      HtmlDisplay.section(
        gui,
        'This dropdown button has four possible values: alpha, beta, gamma, and delta',
        {
          uiType: 'dropdown',
          text: 'Dropdown',
          fetchItems: function () {
            return Future.pure([
              { value: 'alpha', text: 'Alpha' },
              { value: 'beta', text: 'Beta' },
              { value: 'gamma', text: 'Gamma' },
              { value: 'delta', text: 'Delta' }
            ]);
          },
          sink: sink,
          desc: 'demo-dropdown',
          onExecute: function (sandbox, item, itemValue) {
            console.log('*** dropdown demo execute on: ' + itemValue + ' ***');
          }
        }
      );
    };
  }
);