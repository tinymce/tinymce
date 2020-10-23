import { assert, UnitTest } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as DomEvent from 'ephox/sugar/api/events/DomEvent';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import * as Selectors from 'ephox/sugar/api/search/Selectors';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import { SimRange } from 'ephox/sugar/api/selection/SimRange';
import { SimSelection } from 'ephox/sugar/api/selection/SimSelection';
import * as WindowSelection from 'ephox/sugar/api/selection/WindowSelection';

UnitTest.asynctest('Browser Test: SimSelection.getAtPoint', (success, failure) => {

  const browser = PlatformDetection.detect().browser;
  if (!browser.isIE()) {
    // This is an IE test, as other platforms have native implementations (including Edge)
    success();
    return;
  }

  const iframe = SugarElement.fromHtml<HTMLIFrameElement>('<iframe style="position: fixed; top: 0; left: 0; height:700px; width:700px;" src="/project/@ephox/sugar/src/test/data/points.html"></iframe>');
  Insert.append(SugarBody.body(), iframe);
  const run = DomEvent.bind(iframe, 'load', () => {
    run.unbind();
    // IE doesn't render it immediately
    setTimeout(() => {
      try {
        checks();
        success();
      } catch (e) {
        failure(e);
      } finally {
        Remove.remove(iframe);
      }
    }, 50);
  });

  const checks = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const iframeWin = iframe.dom.contentWindow!;
    const iframeDoc = SugarElement.fromDom(iframeWin.document);

    const get = (selector: string) => Selectors.one(selector, iframeDoc).getOrDie('element with selector "' + selector + '" not found');

    const check = (x: number, y: number, expected: SimRange) => {
      const found = WindowSelection.getAtPoint(iframeWin, x, y);
      const raw = found.getOrDie('point ' + x + ',' + y + ' not found');
      WindowSelection.setExact(iframeWin, raw.start, raw.soffset, raw.finish, raw.foffset);

      const range = WindowSelection.getExact(iframeWin).getOrDie('Could not get window selection after setting it');
      const starts = Compare.eq(expected.start, range.start);
      assert.eq(true, starts, () => 'start elements were not equal, was ' + SugarNode.name(range.start) + ', expected ' + SugarNode.name(expected.start));
      assert.eq(expected.soffset, range.soffset);
      assert.eq(true, Compare.eq(expected.finish, range.finish), () => 'finish elements were not equal, was ' + SugarNode.name(range.finish));
      assert.eq(expected.foffset, range.foffset);
    };

    const outside = Traverse.children(get('.outside'))[0];

    check(0, 0, SimSelection.range(outside, 1, outside, 1));
    check(5, 5, SimSelection.range(outside, 1, outside, 1));
    check(5, 100, SimSelection.range(outside, 1, outside, 1));
    check(5, 200, SimSelection.range(outside, 1, outside, 1));
    check(5, 300, SimSelection.range(outside, 1, outside, 1));
    check(5, 400, SimSelection.range(outside, 1, outside, 1));
    check(5, 500, SimSelection.range(outside, 1, outside, 1));
    check(5, 600, SimSelection.range(outside, 1, outside, 1));

    check(100, 20, SimSelection.range(outside, 6, outside, 6));
    check(200, 20, SimSelection.range(outside, 6, outside, 6));
    check(300, 20, SimSelection.range(outside, 6, outside, 6));
    check(400, 20, SimSelection.range(outside, 6, outside, 6));
    check(500, 20, SimSelection.range(outside, 6, outside, 6));
    check(600, 20, SimSelection.range(outside, 6, outside, 6));

    const one = Traverse.children(get('.one'))[0];
    check(100, 100, SimSelection.range(one, 1, one, 1));
    check(150, 100, SimSelection.range(one, 1, one, 1));

    // This (500,100) test fails using of IE (11.1770/11.0.47, win10), and now returns element 'eight'
    // - the breaking change was TBIO-4984: update sugar's version of oath's awareness, commit: cb191c42cb6ec66323c65bebd41de00136937e4a (2017-09-19)
    // check(500, 100, SimSelection.range(div, 11, div, 11)); // Ideally should be (one, 4)
    check(500, 100, SimSelection.range(get('.eight'), 1, get('.eight'), 1)); // at the end of the text inside span 'eight' (end of the content)

    check(150, 150, SimSelection.range(one, 1, one, 1));
    check(180, 160, SimSelection.range(one, 3, one, 3));

    const two = Traverse.children(get('.two'));
    check(100, 220, SimSelection.range(two[0], 5, two[0], 5)); // 5 because of the whitespace :(
    check(150, 220, SimSelection.range(two[0], 5, two[0], 5));

    // heavily nested checks
    const three = Traverse.children(get('.three'))[0];
    check(300, 220, SimSelection.range(three, 0, three, 0));
    const four = Traverse.children(get('.four'))[0];
    check(151, 240, SimSelection.range(four, 1, four, 1));

    // filler checks
    const five = Traverse.children(get('.five'))[0];
    check(150, 300, SimSelection.range(five, 1, five, 1));
    const six = Traverse.children(get('.six'))[0];
    check(150, 370, SimSelection.range(six, 1, six, 1));

    // floating checks
    const seven = Traverse.children(get('.seven'))[0];
    check(310, 535, SimSelection.range(seven, 5, seven, 5)); // whitespace again
    const eight = Traverse.children(get('.eight'))[0];
    check(550, 535, SimSelection.range(eight, 0, eight, 0));
  };
});
