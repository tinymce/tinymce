import * as ApproxStructure from 'ephox/agar/api/ApproxStructure';
import * as Assertions from 'ephox/agar/api/Assertions';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as DemoContainer from 'ephox/agar/demo/DemoContainer';
import { Class, Element, Html, InsertAll } from '@ephox/sugar';

export const demo = (): void => {
  DemoContainer.init(
    'Approx Structure',
    (success, failure) => {

      const div = Element.fromTag('div');

      const p = Element.fromTag('p');

      const span = Element.fromTag('span');

      InsertAll.append(div, [p]);
      InsertAll.append(p, [span]);

      Class.add(span, 'dog');

      Pipeline.async({}, [
        Assertions.sAssertStructure(
          'Assert Structure example: ' + Html.getOuter(div),
          ApproxStructure.build((s, str, arr) =>
            s.element('div', {
              children: [
                s.element('p', {
                  children: [
                    s.element('span', {
                      classes: [arr.has('dog'), arr.not('cat')]
                    })
                  ]
                })
              ]
            })),
          div
        )
      ], success, failure);

      return [div];
    }
  );
};
