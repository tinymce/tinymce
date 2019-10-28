import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as DomFuture from 'ephox/sugar/api/dom/DomFuture';
import Element from 'ephox/sugar/api/node/Element';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.asynctest('Browser Test: .DomFutureTest', function (success, failure) {

  const testElement = Element.fromTag('button');

  DomFuture.waitFor(testElement, 'click', 1000).get(function (res) {
    assert.eq(true, res.isError(), 'Result should be error as click has not yet occurred.');

    DomFuture.waitFor(testElement, 'click', 1000).get(function (r) {
      r.fold(
        function (err) {
          assert.fail('Future should have returned value(event). Instead returned error(' + err + ')');
        },
        function (val) {
          assert.eq(true, Compare.eq(testElement, val.target()), 'Checking that the target of the event is correct');
          success();
        }
      );
    });

    // TODO: test timeout on click
    testElement.dom().click();
  });
});
