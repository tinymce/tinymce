import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as ApproxComparisons from 'ephox/agar/assertions/ApproxComparisons';

describe('browser.agar.assertions.ApproxComparisonsTest', () => {

  context('measurement', () => {
    it('not a string', () => {
      assert.throws(
        () => ApproxComparisons.measurement(10, 'px', 0).strAssert('Label', 2020 as any),
        '"2020" did not have the correct unit. Expected: "px", but was: "2020"'
      );
    });

    it('not a measurement', () => {
      assert.throws(
        () => ApproxComparisons.measurement(10, 'px', 0).strAssert('Label', 'goose'),
        '"goose" was not a valid measurement'
      );
    });

    it('wrong unit', () => {
      assert.throws(
        () => ApproxComparisons.measurement(10, 'px', 0).strAssert('Label', '10rem'),
        '"10rem" did not have the correct unit. Expected: "px", but was: "rem"'
      );
    });

    it('wrong unit, wrong margin', () => {
      assert.throws(
        () => ApproxComparisons.measurement(10, 'px', 0).strAssert('Label', '50rem'),
        '"50rem" did not have the correct unit. Expected: "px", but was: "rem"'
      );
    });

    context('integers', () => {
      it('no unit, wrong margin', () => {
        assert.throws(
          () => ApproxComparisons.measurement(10, '', 8).strAssert('Label', '20'),
          '"20" was not within "8" of the expected value: "10"'
        );
      });

      it('no unit, right margin', () => {
        ApproxComparisons.measurement(10, '', 8).strAssert('Label', '18');
      });

      it('right unit, wrong margin', () => {
        assert.throws(
          () => ApproxComparisons.measurement(10, 'px', 0).strAssert('Label', '20px'),
          '"20px" was not within "0px" of the expected value: "10px"'
        );
      });

      it('right unit, just outside margin (above)', () => {
        assert.throws(
          () => ApproxComparisons.measurement(10, 'em', 15).strAssert('Label', '26em'),
          '"26em" was not within "15em" of the expected value: "10em"'
        );
      });

      it('right unit, exactly margin (above)', () => {
        ApproxComparisons.measurement(10, 'em', 15).strAssert('Label', '25em');
      });

      it('right unit, just inside margin (above)', () => {
        ApproxComparisons.measurement(10, 'em', 15).strAssert('Label', '24em');
      });

      it('right unit, just outside margin (below)', () => {
        assert.throws(
          () => ApproxComparisons.measurement(26, 'em', 15).strAssert('Label', '10em'),
          '"10em" was not within "15em" of the expected value: "26em"'
        );
      });

      it('right unit, exactly margin (below)', () => {
        ApproxComparisons.measurement(25, 'em', 5).strAssert('Label', '20em');
      });

      it('right unit, just inside margin (below)', () => {
        ApproxComparisons.measurement(24, 'em', 15).strAssert('Label', '10em');
      });
    });

    context('floats', () => {
      it('no unit, wrong margin', () => {
        assert.throws(
          () => ApproxComparisons.measurement(10, '', 8).strAssert('Label', '20.5'),
          '"20.5" was not within "8" of the expected value: "10"'
        );
      });

      it('no unit, right margin', () => {
        ApproxComparisons.measurement(10, '', 8).strAssert('Label', '17.5');
      });

      it('right unit, wrong margin', () => {
        assert.throws(
          () => ApproxComparisons.measurement(10, 'px', 0).strAssert('Label', '20.8px'),
          '"20.8px" was not within "0px" of the expected value: "10px"'
        );
      });

      it('right unit, just outside margin (above)', () => {
        assert.throws(
          () => ApproxComparisons.measurement(10.2, 'em', 15).strAssert('Label', '26.5em'),
          '"26.5em" was not within "15em" of the expected value: "10.2em"'
        );
      });

      it('right unit, just inside margin (above)', () => {
        ApproxComparisons.measurement(10.2, 'em', 15).strAssert('Label', '24em');
      });

      it('right unit, just outside margin (below)', () => {
        assert.throws(
          () => ApproxComparisons.measurement(26.3, 'em', 15).strAssert('Label', '8.9em'),
          '"8.9em" was not within "15em" of the expected value: "26.3em"'
        );
      });

      it('right unit, just inside margin (below)', () => {
        ApproxComparisons.measurement(24.9, 'em', 15).strAssert('Label', '10.3em');
      });
    });
  });
});
