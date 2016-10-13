define(
  'ephox.alloy.demo.HtmlDisplay',

  [
    'ephox.alloy.api.GuiFactory',
    'ephox.sugar.api.Html'
  ],

  function (GuiFactory, Html) {

    var section = function (gui, instructions, spec) {
      var information = {
        uiType: 'custom',
        dom: {
          tag: 'p',
          innerHtml: instructions
        }
      };

      var hr = { uiType: 'custom', dom: { tag: 'hr' } };

      gui.add(GuiFactory.build(hr));
      gui.add(GuiFactory.build(information));

      var component = GuiFactory.build(spec);

      var display = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          styles: {
            'padding-left': '100px',
            'padding-top': '20px',
            'padding-right': '100px',
            'border': '1px dashed green'
          }
        },
        components: [
          { built: component }
        ]
      });

      gui.add(display);

      var htmlDump = Html.getOuter(component.element());
      var dump = {
        uiType: 'custom',
        dom: {
          tag: 'p',
          classes: [ 'html-display' ]
        },
        components: [
          { text: htmlDump }
        ]
      };

      gui.add(GuiFactory.build(dump));
      gui.add(GuiFactory.build(hr));

      return component;

    };

    return {
      section: section
    };
  }
);