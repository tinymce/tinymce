define(
  'ephox.alloy.demo.TypeaheadDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.behaviour.Representing',
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

  function (Gui, GuiFactory, GuiTemplate, Representing, DemoTemplates, HtmlDisplay, Arr, Future, Option, Result, Class, Element, Insert, Value, TemplateMenu) {
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

      HtmlDisplay.section(gui,
        'An example of a typeahead component',
        {
          uiType: 'typeahead',
          minChars: 1,
          lazySink: lazySink,
          dom: {
            tag: 'input'
          },
          markers: {
            item: 'alloy-item',
            selectedItem: 'alloy-selected-item',
            menu: 'alloy-menu',
            selectedMenu: 'alloy-selected-menu'
          },
          members: {
            menu: {
              munge: function (spec) {
                return GuiTemplate.use(
                  Option.none(),
                  TemplateMenu,
                  { },
                  {
                    fields: {
                      'aria-label': spec.textkey
                    }
                  }
                );
              }
            },
            item: {
              munge: function (spec) {
                return DemoTemplates.item(spec);
              }
            }
          },
          fetch: function (input) {
            var text = Value.get(input.element());
            var matching = Arr.bind(dataset, function (d) {
              var index = d.indexOf(text.toLowerCase());
              if (index > -1) {
                var html = d.substring(0, index) + '<b>' + d.substring(index, index + text.length) + '</b>' + 
                  d.substring(index + text.length);
                return [ { type: 'item', value: d, text: html, 'item-class': 'class-' + d } ];
              } else {
                return [ ];
              }
            });

            var matches = matching.length > 0 ? matching : [
              { type: 'separator', text: 'No items' }
            ];
   
            return Future.pure(matches);
          },
          onExecute: function (sandbox, item, itemValue) {
            var value = Representing.getValue(item);
            console.log('*** typeahead menu demo execute on: ' + value + ' ***');
          },
          parts: {
            display: {

            }
          }
        }
      );
    };
  }
);