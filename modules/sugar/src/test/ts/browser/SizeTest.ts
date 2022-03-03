import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Height from 'ephox/sugar/api/view/Height';
import * as Width from 'ephox/sugar/api/view/Width';
import Div from 'ephox/sugar/test/Div';

interface SizeApi {
  get: (element: SugarElement<HTMLElement>) => number;
  set: (element: SugarElement<HTMLElement>, value: number | string) => void;
}

UnitTest.test('SizeTest', () => {
  const c = Div();

  const checker = (cssProp: string, api: SizeApi) => {
    const checkExc = (expected: string, f: () => void) => {
      Assert.throwsError('', f, expected);
    };

    const exact = () => Css.getRaw(c, cssProp).getOrDie('value was not set');

    api.set(c, 100);
    Assert.eq('', 100, api.get(c));
    checkExc(cssProp + '.set accepts only positive integer values. Value was 100%', () => {
      api.set(c, '100%');
    });
    checkExc(cssProp + '.set accepts only positive integer values. Value was 100px', () => {
      api.set(c, '100px');
    });
    Assert.eq('', '100px', exact());

    Css.set(c, cssProp, '85%');
    Assert.eq('', '85%', exact());

    if (SugarBody.inBody(c)) {
      // percentage height is calculated as zero, but percentage width works just fine
      if (cssProp === 'height') {
        Assert.eq('', 0, api.get(c));
      } else {
        Assert.eq('', true, api.get(c) > 0);
      }
    }

    Css.set(c, cssProp, '30px');
    Assert.eq('', 30, api.get(c));
    Assert.eq('', '30px', exact());
  };

  checker('height', Height);
  checker('width', Width);
  Insert.append(SugarBody.body(), c);
  checker('height', Height);
  checker('width', Width);

  Remove.remove(c);
});
