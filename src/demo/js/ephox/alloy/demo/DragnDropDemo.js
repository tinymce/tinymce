define(
  'ephox.alloy.demo.DragnDropDemo',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.DragnDrop',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Replication',
    'global!document'
  ],

  function (Gui, Behaviour, DragnDrop, Button, Container, EventHandler, HtmlDisplay, Objects, Fun, Class, Css, Element, Html, Insert, Replication, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());



      var display1 = HtmlDisplay.section(
        gui,
        'The button can be dragged into the the container',
        Container.sketch({
          components: [
            Container.sketch({
              dom: {
                styles: {
                  'background-color': 'black',
                  width: '20px',
                  height: '20px'
                }
              },
              action: function () {
                console.log('*** Image ButtonDemo click ***');
              },

              behaviours: Behaviour.derive([
                DragnDrop.config({
                  mode: 'drag',
                  type: 'text/html',
                  getData: function (button) {
                    return '<button>Hi there</button>';
                  },
                  getImage: function (button) {
                    return {
                      element: function () {
                        var clone = Replication.deep(button.element());
                        Css.set(clone, 'background-color', 'blue');
                        return clone;
                      },
                      x: Fun.constant(0),
                      y: Fun.constant(0)
                    };
                  }
                })
              ])
            }),

            Container.sketch({
              dom: {
                styles: {
                  background: 'red',
                  width: '100px',
                  height: '100px'
                }
              },
              behaviours: Behaviour.derive([
                DragnDrop.config({
                  mode: 'drop',
                  type: 'text/html',
                  onDrop: function (zone, data, event) {
                    event.kill();
                    var next = Element.fromHtml(data);
                    Insert.append(zone.element(), next);
                  }
                })
              ])
            })
          ]
        })    
      );
    };
  }
);
