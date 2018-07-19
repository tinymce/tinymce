import * as FocusTools from 'ephox/agar/api/FocusTools';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import DemoContainer from 'ephox/agar/demo/DemoContainer';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';



export default <any> function () {
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