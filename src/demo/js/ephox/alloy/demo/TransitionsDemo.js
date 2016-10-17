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
              help: function (revertToBase) {
                return [{
                  uiType: 'container',
                  dom: {
                    innerHtml: 'This is going to be the help page'
                  },
                  components: [
                    { uiType: 'button', action: revertToBase, text: 'X' }
                  ]
                }];
              }
            },
            base: [{ uiType: 'container' }]
          }
        }
      );

      subject.apis().transition('help');
      setTimeout(function () {
        subject.apis().transition('dog');
      }, 10000);
    };
  }
);