define(
  'ephox.alloy.demo.HtmlDisplay',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.properties.TextContent',
    'global!setInterval'
  ],

  function (GuiFactory, Container, Fun, Id, Html, TextContent, setInterval) {
    var JsBeautify = {
      html: Fun.identity
    };
    
    var section = function (gui, instructions, spec) {
      var information = Container.sketch({
        dom: {
          tag: 'p',
          innerHtml: instructions
        }
      });

      var component = GuiFactory.build(spec);
      component.logSpec();
    
      var display = GuiFactory.build(
        Container.sketch({
          dom: {
            styles: {
              'padding-left': '100px',
              'padding-top': '20px',
              'padding-right': '100px',
              'border': '1px dashed green'
            }
          },
          components: [
            GuiFactory.premade(component)
          
          ]
        })
      );

      var dumpUid = Id.generate('html-dump');

      var htmlDump = Html.getOuter(component.element());
      var dump = Container.sketch({
        uid: dumpUid,
        dom: {
          tag: 'p',
          classes: [ 'html-display' ]
        },
        components: [
          GuiFactory.text(JsBeautify.html(htmlDump))
        ]
      });

      var updateHtml = function () {
        gui.getByUid(dumpUid).each(function (dumpC) {
          // NOTE: Use Body.body() here for more information.
          TextContent.set(dumpC.element(), JsBeautify.html(Html.getOuter(component.element())));
        });
      };

      var observer = new MutationObserver(function (mutations) {
        updateHtml();
      });

      observer.observe(component.element().dom(), { attributes: true, childList: true, characterData: true, subtree: true });

      var all = GuiFactory.build(
        Container.sketch({
          components: [
            Container.sketch({ dom: { tag: 'hr' } }),
            information,
            GuiFactory.premade(display),
            dump,
            Container.sketch({ dom: { tag: 'hr' } })
          ]
        })
      );

      gui.add(all);

      return component;

    };

    return {
      section: section
    };
  }
);