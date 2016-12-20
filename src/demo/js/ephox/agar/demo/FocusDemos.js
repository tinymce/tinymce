define(
  'ephox.agar.demo.FocusDemos',

  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Pipeline',
    'ephox.agar.demo.DemoContainer',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.search.Traverse'
  ],

  function (FocusTools, Pipeline, DemoContainer, Attr, Css, DomEvent, Element, Html, InsertAll, Traverse) {
    return function () {
      DemoContainer.init('Focus demos', function (success, failure) {

        var div = Element.fromTag('div');

        var button = Element.fromTag('button');
        Html.set(button, 'Go');

        var game = Element.fromTag('div');
        Css.set(game, 'display', 'none');
        InsertAll.append(div, [ button, game ]);

        var instructions = Element.fromTag('p');
        Html.set(instructions, 'You have 4 seconds to focus the input');

        var field = Element.fromTag('input');
        Attr.set(field, 'placeholder', 'Focus me quickly');

        InsertAll.append(game, [ instructions, field ]);

        var onClick = function () {
          handler.unbind();
          Css.remove(game, 'display');
          Attr.set(button, 'disabled', 'disabled');

          Pipeline.async({}, [
            FocusTools.sTryOnSelector('You were not fast enough', Traverse.owner(game), 'input')
          ], function () {
            Css.set(game, 'color', 'blue');
            success();
          }, failure);
        };

        var handler = DomEvent.bind(button, 'click', onClick);

        return [ div ];
      });
    };
  }
);