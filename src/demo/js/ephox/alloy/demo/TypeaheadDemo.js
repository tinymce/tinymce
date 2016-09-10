define(
  'ephox.alloy.demo.TypeaheadDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Gui, GuiFactory, HtmlDisplay, Future, Class, Element, Insert) {
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

      HtmlDisplay.section(gui,
        'An example of a typeahead component',
        {
          uiType: 'lookahead',
          desc: 'typeahead-desc',
          sink: sink,
          fetchItems: function () {
            console.log('fetching');
            return Future.pure([
              { value: 'd', text: 'D' }
            ]);
          }
        }
      );
    };
  }
);