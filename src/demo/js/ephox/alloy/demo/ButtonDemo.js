define(
  'ephox.alloy.demo.ButtonDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.behaviour.CustomBehaviour',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, GuiFactory, Toggling, CustomBehaviour, HtmlDisplay, DomModification, ValueSchema, Merger, Fun, Class, Css, Element, Html, Insert, document) {
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
        }
      );

      var button2 = HtmlDisplay.section(
        gui,
        'This toggle button is a <code>span</code> tag with an font',
        {
          uiType: 'button',
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
          toggling: {
            toggleClass: 'demo-selected'
          }
        }
      );

      Toggling.select(button2);

      var customButton = HtmlDisplay.section(
        gui,
        'This text button has two custom behaviours. One adds (among other things) "data-cat" and ' +
        'background blue, and the other adds color red',
        {
          uiType: 'button',
          dom: {
            tag: 'span',
            innerHtml: 'Button.with.Text'
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

      var group1 = HtmlDisplay.section(
        gui,
        'This button can only have one value selected. It can not be turned off',
        {
          uiType: 'groupbutton',

          dom: {
            tag: 'div'
          },
          components: [
            { uiType: 'placeholder', name: '<alloy.group-buttons>', owner: 'groupbutton' }
          ],

          members: {
            button: {
              munge: function (bSpec) {
                return Merger.deepMerge(
                  bSpec,
                  {
                    dom: {
                      tag: 'button',
                      innerHtml: bSpec.text
                    }
                  }
                );
              }
            }
          },
          
          markers: {
            buttonClass: 'group-button',
            selectedClass: 'demo-selected'
          },
          
          buttons: [
            { value: 'alpha', text: 'Alpha' },
            { value: 'beta', text: 'Beta' },
            { value: 'gamma', text: 'Gamma' }
          ],
          action: function (value) {
            console.log('fired value', value);
          }
        }
      );
    };
  }
);

