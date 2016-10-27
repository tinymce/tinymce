define(
  'ephox.alloy.demo.TransitionsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/demo.tabbing.html'
  ],

  function (Gui, GuiTemplate, HtmlDisplay, Option, Class, Element, Insert, document, TemplateTabs) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      // var subject = HtmlDisplay.section(
      //   gui,
      //   'instructions',
      //   {
      //     uiType: 'container',
      //     keying: {
      //       mode: 'cyclic'
      //     },
      //     transitioning: {
      //       views: {
      //         'insert_link': function (component, revertToBase) {
      //           return [
      //             {
      //               uiType: 'formlabel',
      //               label: { text: 'Hyperlink' },
      //               field: { uiType: 'input' },
      //               prefix: 'link_',
      //               dom: {
      //                 styles: {
      //                   display: 'inline-block'
      //                 }
      //               }
      //             },
      //             {
      //               uiType: 'button',
      //               dom: {
      //                 tag: 'button',
      //                 innerHtml: 'x'
      //               },
      //               action: revertToBase
      //             }
      //           ];
      //         }
      //       },
      //       base: function (component) {
      //         var moveTo = function (view) {
      //           return function () {
      //             component.apis().transition(view);
      //           };
      //         };

      //         return [
      //           {
      //             uiType: 'button',
      //             dom: {
      //               tag: 'button',
      //               innerHtml: 'Insert Link'
      //             },
      //             action: moveTo('insert_link')
      //           }
      //         ];
      //       },
      //       onChange: function (component) {
      //         component.apis().focusIn();
      //       }
      //     }
      //   }
      // );

      // subject.apis().revertToBase();

      var subject2 = HtmlDisplay.section(
        gui,
        'A basic tab view',
        GuiTemplate.use(
          Option.some('tabs'),
          TemplateTabs,
          {
            uiType: 'tabs',
            parts: {
              'tabbar': { },
              'tabview': { }
            } 
          }, {

          }
        )
      );
    };
  }
);