import { Attribute, Css, DomEvent, Html, InsertAll, SugarElement, Traverse } from '@ephox/sugar';

import * as FocusTools from 'ephox/agar/api/FocusTools';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as DemoContainer from 'ephox/agar/demo/DemoContainer';

export const demo = (): void => {
  DemoContainer.init('Focus demos', (success, failure) => {

    const div = SugarElement.fromTag('div');

    const button = SugarElement.fromTag('button');
    Html.set(button, 'Go');

    const game = SugarElement.fromTag('div');
    Css.set(game, 'display', 'none');
    InsertAll.append(div, [ button, game ]);

    const instructions = SugarElement.fromTag('p');
    Html.set(instructions, 'You have 4 seconds to focus the input');

    const field = SugarElement.fromTag('input');
    Attribute.set(field, 'placeholder', 'Focus me quickly');

    InsertAll.append(game, [ instructions, field ]);

    const onClick = () => {
      handler.unbind();
      Css.remove(game, 'display');
      Attribute.set(button, 'disabled', 'disabled');

      Pipeline.async({}, [
        FocusTools.sTryOnSelector('You were not fast enough', Traverse.owner(game), 'input')
      ], () => {
        Css.set(game, 'color', 'blue');
        success();
      }, failure);
    };

    const handler = DomEvent.bind(button, 'click', onClick);

    return [ div ];
  });
};
