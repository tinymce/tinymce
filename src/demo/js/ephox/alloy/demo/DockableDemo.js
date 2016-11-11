define(
  'ephox.alloy.demo.DockableDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, HtmlDisplay, Option, Class, Css, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      // Css.set(gui.element(), 'direction', 'rtl');

      Insert.append(body, gui.element());
      Css.set(body, 'margin-bottom', '2000px');

      var dockable = HtmlDisplay.section(
        gui,
        'The blue panel will always stay on screen as long as the red rectangle is on screen',
        {
          uiType: 'container',
          uid: 'panel-container',
          dom: {
            styles: {
              background: 'red',
              width: '500px',
              height: '600px',
              'z-index': '50'
            }
          },
          components: [
            {
              uiType: 'container',
              dom: {
                tag: 'div',
                styles: {
                  background: '#cadbee',
                  width: '400px',
                  height: '50px',
                  border: '2px solid black',
                  position: 'absolute',
                  top: '300px',
                  left: '10px',
                  'z-index': '100'
                }
              },
              docking: {
                contextual: {
                  transitionClass: 'demo-alloy-dock-transition',
                  fadeOutClass: 'demo-alloy-dock-fade-out',
                  fadeInClass: 'demo-alloy-dock-fade-in',
                  lazyContext: function (component) {
                    return component.getSystem().getByUid('panel-container').fold(Option.none, Option.some);
                  }
                }
              }
            }
          ]
        }
      );

    };
  }
);