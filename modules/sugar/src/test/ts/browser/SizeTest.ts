import { assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLElement } from '@ephox/dom-globals';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Height from 'ephox/sugar/api/view/Height';
import * as Width from 'ephox/sugar/api/view/Width';
import Div from 'ephox/sugar/test/Div';

interface SizeApi {
  get: (element: Element<HTMLElement>) => number;
  set: (element: Element<HTMLElement>, value: number | string) => void;
}


UnitTest.test('SizeTest', () => {
  const c = Div();

  const checker = (cssProp: string, api: SizeApi) => {
    const checkExc = (expected: string, f: () => void) => {
      try {
        f();
        assert.fail('Expected exception not thrown.');
      } catch (e) {
        assert.eq(expected, e.message);
      }
    };

    const exact = () => Css.getRaw(c, cssProp).getOrDie('value was not set');

    api.set(c, 100);
    assert.eq(100, api.get(c));
    checkExc(cssProp + '.set accepts only positive integer values. Value was 100%', () => {
      api.set(c, '100%');
    });
    checkExc(cssProp + '.set accepts only positive integer values. Value was 100px', () => {
      api.set(c, '100px');
    });
    assert.eq('100px', exact());

    Css.set(c, cssProp, '85%');
    assert.eq('85%', exact());

    if (Body.inBody(c)) {
      // percentage height is calcualted as zero, but percentage width works just fine
      if (cssProp === 'height') {
        assert.eq(0, api.get(c));
      } else {
        assert.eq(true, api.get(c) > 0);
      }
    }

    Css.set(c, cssProp, '30px');
    assert.eq(30, api.get(c));
    assert.eq('30px', exact());
  };

  checker('height', Height);
  checker('width', Width);
  Insert.append(Body.body(), c);
  checker('height', Height);
  checker('width', Width);

  Remove.remove(c);
});
