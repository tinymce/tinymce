import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as DomFuture from 'ephox/sugar/api/dom/DomFuture';
import Element from 'ephox/sugar/api/node/Element';

UnitTest.asynctest('Browser Test: .DomFutureTest', (success) => {

  const testElement = Element.fromTag('button');

  DomFuture.waitFor(testElement, 'click', 1000).get((res) => {
    assert.eq(true, res.isError(), 'Result should be error as click has not yet occurred.');

    DomFuture.waitFor(testElement, 'click', 1000).get((r) => {
      r.fold(
        (err) => {
          assert.fail('Future should have returned value(event). Instead returned error(' + err + ')');
        },
        (val) => {
          assert.eq(true, Compare.eq(testElement, val.target()), 'Checking that the target of the event is correct');
          success();
        }
      );
    });

    // TODO: test timeout on click
    testElement.dom().click();
  });
});
