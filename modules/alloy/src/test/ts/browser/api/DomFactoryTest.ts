import { Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';

import * as DomFactory from 'ephox/alloy/api/component/DomFactory';

UnitTest.test('DomFactoryTest', () => {
  Assertions.assertEq('Basic DomFactory.simple', {
    dom: {
      tag: 'span',
      classes: [ 'bb' ]
    },
    components: [
      {
        dom: {
          tag: 'div'
        },
        components: [ ]
      }
    ]
  }, DomFactory.simple('span', [ 'bb' ], [
    {
      dom: {
        tag: 'div'
      },
      components: [ ]
    }
  ]));

  Assertions.assertEq(
    'Basic DomFactory.dom',
    {
      tag: 'span',
      classes: [ 'bbb' ],
      styles: { },
      attributes: { }
    },
    DomFactory.dom('span', [ 'bbb' ])
  );
});