import * as ApproxStructure from 'ephox/agar/api/ApproxStructure';
import * as Assertions from 'ephox/agar/api/Assertions';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import DemoContainer from 'ephox/agar/demo/DemoContainer';
import { Class, Element, Html, InsertAll } from '@ephox/sugar';

export default <any> function () {
  DemoContainer.init(
    'Approx Structure',
    function (success, failure) {

      const div = Element.fromTag('div');

      const p = Element.fromTag('p');

      const span = Element.fromTag('span');

      InsertAll.append(div, [ p ]);
      InsertAll.append(p, [ span ]);

      Class.add(span, 'dog');

      Pipeline.async({}, [
        Assertions.sAssertStructure(
          'Assert Structure example: ' + Html.getOuter(div),
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('p', {
                  children: [
                    s.element('span', {
                      classes: [ arr.has('dog'), arr.not('cat') ]
                    })
                  ]
                })
              ]
            });
          }),
          div
        )
      ], success, failure);

      return [ div ];
    }
  );
};
