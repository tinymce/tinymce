define(
  'ephox.alloy.demo.TypeaheadDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.compass.Arr',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Gui, GuiFactory, HtmlDisplay, Arr, Future, Class, Element, Insert) {
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

      HtmlDisplay.section(gui,
        'An example of a typeahead component',
        {
          uiType: 'typeahead',
          desc: 'typeahead-desc',
          minChars: 1,
          sink: sink,
          fetchItems: function (text) {
            var matching = Arr.bind(dataset, function (d) {
              var index = d.indexOf(text.toLowerCase());
              if (index > -1) {
                var html = d.substring(0, index) + '<b>' + d.substring(index, index + text.length) + '</b>' + 
                  d.substring(index + text.length);
                return [
                  { value: d, text: d, html: html }
                ];
              } else {
                return [ ];
              }
            });
   
            return Future.pure(matching);
          }
        }
      );
    };
  }
);