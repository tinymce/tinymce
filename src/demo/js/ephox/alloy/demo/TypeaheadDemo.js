define(
  'ephox.alloy.demo.TypeaheadDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.demo.DemoTemplates',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.compass.Arr',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Value',
    'text!dom-templates/demo.menu.html'
  ],

  function (Gui, GuiFactory, GuiTemplate, Representing, Typeahead, MenuData, DemoTemplates, HtmlDisplay, Arr, Future, Option, Result, Class, Element, Insert, Value, TemplateMenu) {
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
        behaviours: {
          positioning: {
            useFixed: true
          }
        }
      });

      gui.add(sink);

      var dataset = [
        'ant',
        'bison',
        'cat',
        'dog',
        'elephant',
        'frog',
        'goose',
        'hyena',
        'iguana',
        'jaguar',
        'koala',
        'lemur',
        'mongoose',
        'narwhal',
        'orca',
        'pig',
        'quoll',
        'robin',
        'snake',
        'tern',
        'uakari',
        'viper',
        'wombat',
        'x',
        'yak',
        'zebra'
      ];

      var lazySink = function () {
        return Result.value(sink);
      };

      var listMenu = {
        members: {
          menu: {
            munge: function (spec) {
              return {
                dom: {
                  tag: 'ol',
                  attributes: {
                    'aria-label': spec.text
                  },
                  classes: [ 'demo-alloy-menu' ]
                },
                shell: true,
                components: [ ]
              };
            }
          },
          item: {
            munge: function (spec) {

              return spec.type === 'separator' ? {
                uiType: 'container',
                dom: {
                  tag: 'div',
                  classes: [  ],
                  innerHtml: spec.text
                },
                components: [

                ]
              } : {
                dom: {
                  tag: 'li',
                  classes: spec.type === 'item' ? [ 'alloy-item' ] : [ ],
                  innerHtml: spec.data.html
                },
                components: [

                ]
              };
            }
          }
        },
        markers: {
          item: 'alloy-item',
          selectedItem: 'alloy-selected-item',
          menu: 'alloy-menu',
          selectedMenu: 'alloy-selected-menu',
          'backgroundMenu': 'alloy-background-menu'
        }
      };

      HtmlDisplay.section(gui,
        'An example of a typeahead component',
        Typeahead.build(function (parts) {
          return {
            minChars: 1,
            lazySink: lazySink,
            dom: {
              tag: 'input'
            },

            parts: {
              menu: listMenu
            },
            fetch: function (input) {
              var text = Value.get(input.element());
              console.log('text', text);
              var matching = Arr.bind(dataset, function (d) {
                var index = d.indexOf(text.toLowerCase());
                if (index > -1) {
                  var html = d.substring(0, index) + '<b>' + d.substring(index, index + text.length) + '</b>' + 
                    d.substring(index + text.length);
                  return [ { type: 'item', data: { value: d, text: d, html: html }, 'item-class': 'class-' + d } ];
                } else {
                  return [ ];
                }
              });

              var matches = matching.length > 0 ? matching : [
                { type: 'separator', text: 'No items' }
              ];
     
              var future = Future.pure(matches);
              return future.map(function (items) {
                return MenuData.simple('blah', 'Blah', items);
              });
            },
            onExecute: function (sandbox, item, itemValue) {
              var value = Representing.getValue(item);
              return Option.some(true);
              console.log('*** typeahead menu demo execute on: ' + value + ' ***');
            }
          };
        })
      );
    };
  }
);