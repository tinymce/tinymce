define(
  'ephox.alloy.demo.TransitionsDemo',

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

      var subject = HtmlDisplay.section(
        gui,
        'instructions',
        {
          uiType: 'container',
          transitioning: {
            views: {
              'insert_link': function (component, revertToBase) {
                return [
                  {
                    uiType: 'formlabel',
                    label: { text: 'Hyperlink' },
                    field: { uiType: 'input' },
                    prefix: 'link_',
                    dom: {
                      styles: {
                        display: 'inline-block'
                      }
                    }
                  },
                  {
                    uiType: 'button',
                    action: revertToBase,
                    text: 'X'
                  }
                ];
              }
            },
            base: function (component) {
              var moveTo = function (view) {
                return function () {
                  component.apis().transition(view);
                };
              };

              return [
                { uiType: 'button', text: 'Insert Link', action: moveTo('insert_link') }
              ];
            }
          }
        }
      );

      subject.apis().revertToBase();

      // subject.apis().transition('help');
    };
  }
);