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

      var catBehaviour = CustomBehaviour('blah', {
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
      });

      var redBehaviour = CustomBehaviour('blah2', {
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
      });

      var button1 = HtmlDisplay.section(
        gui,
        'This button is a <code>button</code> tag with an image',
        {
          uiType: 'button',
          buttonType: {
            mode: 'image',
            url: 'http://yamaha/textbox/icons/Transforms13.png'
          },
          action: function () {
            console.log('*** Image ButtonDemo click ***');
          },
          dom: {
            styles: {
              'background-color': 'black'
            }
          }
        }
      );

      var button2 = HtmlDisplay.section(
        gui,
        'This toggle button is a <code>span</code> tag with an font',
        {
          uiType: 'button',
          buttonType: {
            mode: 'font',
            classes: [ 'demo-alloy-bold' ]
          },
          action: function () {
            console.log('*** Font ButtonDemo click ***');
          },
          dom: {
            tag: 'span',
            styles: {
              border: '1px solid #ccc',
              display: 'inline-block'
            }
          },
          toggling: {
            toggleClass: 'demo-selected'
          }
        }
      );

      var customButton = HtmlDisplay.section(
        gui,
        'This text button has two custom behaviours. One adds (among other things) "data-cat" and ' +
        'background blue, and the other adds color red',
        {
          uiType: 'button',
          buttonType: {
            mode: 'text',
            text: 'Button.with.Text'
          },
          dom: {
            tag: 'span'
          },
          action: function () {
            console.log('*** ButtonDemo click ***');
          },
          behaviours: [
            catBehaviour,
            redBehaviour            
          ],
          blah: true,
          'blah2': true
        }
      );
    };
  }
);

