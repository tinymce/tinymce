import { Attribute, Css, DomEvent, Html, Insert, InsertAll, Remove, SugarElement, Value } from '@ephox/sugar';

import { Chain } from 'ephox/agar/api/Chain';
import * as FocusTools from 'ephox/agar/api/FocusTools';
import * as Mouse from 'ephox/agar/api/Mouse';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as DemoContainer from 'ephox/agar/demo/DemoContainer';

export const demo = (): void => {
  DemoContainer.init(
    'Form Demo',
    (success, failure) => {
      const form = SugarElement.fromTag('form');

      const start = SugarElement.fromHtml<HTMLButtonElement>('<button>Go</button>');
      DomEvent.bind(start, 'click', () => {
        Remove.remove(start);

        const labelName = SugarElement.fromTag('label');
        Html.set(labelName, 'Name');
        const fieldName = SugarElement.fromHtml<HTMLInputElement>('<input type="text" />');

        const submit = SugarElement.fromTag('button');
        Attribute.set(submit, 'type', 'button');
        Html.set(submit, 'Apply');

        DomEvent.bind(submit, 'click', () => {
          if (Value.get(fieldName) !== 'test') {
            Css.set(fieldName, 'border', '3px solid red');
          } else {
            Css.remove(fieldName, 'border');
          }
        });

        InsertAll.append(form, [ labelName, fieldName, submit ]);

        // The step version
        /*
        Pipeline.async({}, [
          FocusTools.sSetFocus('Move to field', form, 'input'),
          Step.wait(100),
          FocusTools.sSetActiveValue(doc, 'wrong value'),
          Step.wait(100),
          Mouse.sClickOn(form, 'button:contains("Apply")'),
          Step.wait(1000),
          FocusTools.sSetActiveValue(doc, 'test'),
          Mouse.sClickOn(form, 'button:contains("Apply")'),
          Step.wait(1000)
        ], success, failure);
        */

        // The chain version
        const cGetForm = Chain.inject(form);

        Pipeline.async({}, [
          Chain.asStep({}, [
            Chain.fromParent(cGetForm, [
              FocusTools.cSetFocus('Move to field', 'input'),
              Chain.wait(100),
              FocusTools.cSetActiveValue('wrong value'),
              Chain.wait(100),
              Mouse.cClickOn('button:contains("Apply")'),
              Chain.wait(1000),
              FocusTools.cSetActiveValue('test'),
              Mouse.cClickOn('button:contains("Apply")'),
              Chain.wait(1000)
            ])
          ])
        ], success, failure);

      });

      Insert.append(form, start);

      return [ form ];
    }
  );
};
