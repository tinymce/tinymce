define(
  'ephox.alloy.demo.HtmlDisplay',

  [
    'ephox.alloy.api.GuiFactory',
    'ephox.epithet.Id',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.TextContent',
    'ephox.wrap.JsBeautify'
  ],

  function (GuiFactory, Id, Html, TextContent, JsBeautify) {

    var section = function (gui, instructions, spec) {
      var information = {
        uiType: 'custom',
        dom: {
          tag: 'p',
          innerHtml: instructions
        }
      };

      var hr = { uiType: 'custom', dom: { tag: 'hr' } };

      var component = GuiFactory.build(spec);
      component.logSpec();
      console.log('Component APIs: ', component.apis());

    

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

      var dumpUid = Id.generate('html-dump');

      var htmlDump = Html.getOuter(component.element());
      var dump = {
        uiType: 'custom',
        uid: dumpUid,
        dom: {
          tag: 'p',
          classes: [ 'html-display' ]
        },
        components: [
          { text: JsBeautify.html(htmlDump) }
        ]
      };

      setInterval(function () {
        var dumpC = gui.getByUid(dumpUid).getOrDie();
        TextContent.set(dumpC.element(), JsBeautify.html(Html.getOuter(component.element())));
      }, 3000);

      var all = GuiFactory.build({
        uiType: 'container',
        components: [
          hr,
          information,
          { built: display },
          dump,
          hr
        ]
      });

      gui.add(all);

      return component;

    };

    return {
      section: section
    };
  }
);