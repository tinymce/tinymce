define(
  'ephox.alloy.demo.ButtonDemo',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, Behaviour, Behaviour, Toggling, Button, HtmlDisplay, DomModification, Objects, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

   

      var redBehaviour = Behaviour.create([ ], 'red.behaviour', {
        exhibit: function (base, info) {
          return DomModification.nu({
            classes: [ 'cat' ],
            attributes: {
              
            },
            styles: {
              color: 'red'
            }
          });
        }
      }, {

      });


      var catBehaviour = Behaviour.create([ ], 'cat.behaviour', {
        exhibit: function (base, info) {
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
      }, {


      });

      var button1 = HtmlDisplay.section(
        gui,
        'This button is a <code>button</code> tag with an image',
        Button.build({
          dom: {
            tag: 'button',
            styles: {
              'background-color': 'black',
              'background-image': 'url(http://yamaha/textbox/icons/Transforms13.png)',
              width: '20px',
              height: '20px'
            }
          },
          action: function () {
            console.log('*** Image ButtonDemo click ***');
          }
        })
      );

      var button2 = HtmlDisplay.section(
        gui,
        'This toggle button is a <code>span</code> tag with an font',
        Button.build({
          dom: {
            tag: 'button',
            classes: [ 'demo-alloy-bold' ],
            styles: {
              border: '1px solid #ccc',
              display: 'inline-block'
            }
          },
          action: function () {
            console.log('*** Font ButtonDemo click ***');
          },
          behaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: 'demo-selected'
            })
          ])
        })
      );

      button2.logSpec();

      Toggling.select(button2);



      var customButton = HtmlDisplay.section(
        gui,
        'This text button has two custom behaviours. One adds (among other things) "data-cat" and ' +
        'background blue, and the other adds color red',
        Button.build({
          dom: {
            tag: 'span',
            innerHtml: 'Button.with.Text'
          },
          action: function () {
            console.log('*** ButtonDemo click ***');
          },

          behaviours: {
            'red.behaviour': { },
            'cat.behaviour': { }
          },
          customBehaviours: [
            catBehaviour,
            redBehaviour            
          ]
        })
      );
    };
  }
);

