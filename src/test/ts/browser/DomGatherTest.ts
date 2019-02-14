import { UnitTest, assert } from '@ephox/bedrock';
import { Page } from '../module/ephox/phoenix/test/Page';
import * as DomGather from 'ephox/phoenix/api/dom/DomGather';
import { Arr } from '@ephox/katamari';

UnitTest.test('DomGatherTest', function () {
  var page = Page();

    var is = function (x) {
      return function (e) {
        return e.dom() === x.dom();
      };
    };

    var check = function (spec) {
      var actual = spec.seek(spec.element, spec.predicate, is(page.container)).getOrDie('No actual element found.');
      assert.eq(spec.expected.dom(), actual.dom());
    };

    var cases = [
      {
        seek: DomGather.seekLeft,
        element: page.p2,
        predicate: is(page.p1),
        expected: page.p1
      },
      {
        seek: DomGather.seekRight,
        element: page.p1,
        predicate: is(page.p2),
        expected: page.p2
      }
    ];

    page.connect();
    Arr.map(cases, check);
    page.disconnect();
});