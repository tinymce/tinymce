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
    'text!dom-templates/demo.tabbar.html',
    'text!dom-templates/demo.tabbing.html'
  ],

  function (Gui, GuiTemplate, HtmlDisplay, Option, Class, Element, Insert, document, TemplateTabbar, TemplateTabs) {
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
      //         Keying.focusIn(component);
      //       }
      //     }
      //   }
      // );

      // subject.apis().revertToBase();

      var subject2 = HtmlDisplay.section(
        gui,
        'A basic tab view',
        GuiTemplate.use(
          Option.some('tabbing'),
          TemplateTabs,
          {
            uiType: 'tabbing',
            tabs: [
              { value: 'alpha', text: 'alpha', view: function () { 
                return [{
                  uiType: 'input'
                }];
              } },
              { value: 'beta', text: 'beta', view: function () {
                return [{
                  uiType: 'button',
                  action: function () { console.log('button'); },
                  dom: {
                    tag: 'button'
                  }
                }];
              } },
              { value: 'gamma', text: 'gamma', view: function () {
                return [{
                  uiType: 'input'
                }];
              } }
            ],
            defaultView: function () {
              return [{
                uiType: 'container',
                dom: {
                  innerHtml: 'Loading'
                }
              }];
            },
            parts: {
              'tabbar': GuiTemplate.use(
                Option.some('tabbar'),
                TemplateTabbar,
                {
                  uiType: 'container',
                  parts: {
                    tabs: { }
                  },
                  markers: {
                    tabClass: 'tab-button',
                    selectedClass: 'demo-selected'
                  },
                  
                  members: {
                    tab: {
                      munge: function (spec) {
                        return { 
                          dom: {
                            tag: 'button',
                            styles: {
                              margin: '0px'
                            },
                            classes: [ 'tab-button' ],
                            innerHtml: spec.text
                          },
                          components: [ ]
                        };
                      }
                    }
                  }
                },
                { }
              ),
              'tabview': { }
            } 
          }, {

          }
        )
      );
    };
  }
);