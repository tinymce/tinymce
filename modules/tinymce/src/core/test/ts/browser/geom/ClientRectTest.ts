import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import * as ClientRect from 'tinymce/core/geom/ClientRect';

UnitTest.asynctest('browser.tinymce.core.geom.ClientRectTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  const rect = (x, y, w, h) => {
    return {
      left: x,
      top: y,
      bottom: y + h,
      right: x + w,
      width: w,
      height: h
    };
  };

  suite.test('clone', () => {
    LegacyUnit.deepEqual(ClientRect.clone(rect(10, 20, 30, 40)), rect(10, 20, 30, 40));
    LegacyUnit.deepEqual(ClientRect.clone(rect(10.1, 20.1, 30.1, 40.1)), rect(10, 20, 30, 40));
  });

  suite.test('collapse', () => {
    LegacyUnit.deepEqual(ClientRect.collapse(rect(10, 20, 30, 40), true), rect(10, 20, 0, 40));
    LegacyUnit.deepEqual(ClientRect.collapse(rect(10, 20, 30, 40), false), rect(40, 20, 0, 40));
  });

  suite.test('isAbove', () => {
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 70, 10, 40), rect(20, 40, 10, 20)), false);
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 40, 10, 20), rect(20, 70, 10, 40)), true);
  });

  suite.test('isAbove intersects', () => {
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 20, 10, 10), rect(20, 20, 10, 10)), false);
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 20, 10, 40), rect(20, 20, 10, 10)), false);
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 20, 10, 10), rect(20, 20, 10, 40)), false);
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 15, 10, 10)), false);
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 15, 10, 10), rect(20, 20, 10, 10)), false);
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 10, 10, 40), rect(20, 40, 10, 10)), false);
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 20, 10, 10)), true);
    LegacyUnit.equal(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 16, 10, 10)), true);
  });

  suite.test('isBelow', () => {
    LegacyUnit.equal(ClientRect.isBelow(rect(10, 70, 10, 40), rect(20, 40, 10, 20)), true);
    LegacyUnit.equal(ClientRect.isBelow(rect(10, 40, 10, 20), rect(20, 70, 10, 40)), false);
  });

  suite.test('isBelow intersects', () => {
    LegacyUnit.equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 20)), true);
    LegacyUnit.equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 25)), true);
    LegacyUnit.equal(ClientRect.isBelow(rect(10, 15, 10, 20), rect(20, 30, 10, 20)), false);
    LegacyUnit.equal(ClientRect.isBelow(rect(10, 29, 10, 20), rect(20, 10, 10, 30)), false);
    LegacyUnit.equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 30)), true);
    LegacyUnit.equal(ClientRect.isBelow(rect(10, 20, 10, 20), rect(20, 10, 10, 30)), false);
  });

  suite.test('isLeft', () => {
    LegacyUnit.equal(ClientRect.isLeft(rect(10, 20, 30, 40), rect(20, 20, 30, 40)), true);
    LegacyUnit.equal(ClientRect.isLeft(rect(20, 20, 30, 40), rect(10, 20, 30, 40)), false);
  });

  suite.test('isRight', () => {
    LegacyUnit.equal(ClientRect.isRight(rect(10, 20, 30, 40), rect(20, 20, 30, 40)), false);
    LegacyUnit.equal(ClientRect.isRight(rect(20, 20, 30, 40), rect(10, 20, 30, 40)), true);
  });

  suite.test('compare', () => {
    LegacyUnit.equal(ClientRect.compare(rect(10, 70, 10, 40), rect(10, 40, 10, 20)), 1);
    LegacyUnit.equal(ClientRect.compare(rect(10, 40, 10, 20), rect(10, 70, 10, 40)), -1);
    LegacyUnit.equal(ClientRect.compare(rect(5, 10, 10, 10), rect(10, 10, 10, 10)), -1);
    LegacyUnit.equal(ClientRect.compare(rect(15, 10, 10, 10), rect(10, 10, 10, 10)), 1);
  });

  suite.test('containsXY', () => {
    LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 1, 2), false);
    LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 15, 2), false);
    LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 25, 2), false);
    LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 10, 70), true);
    LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 20, 110), true);
    LegacyUnit.equal(ClientRect.containsXY(rect(10, 70, 10, 40), 15, 75), true);
  });

  suite.test('getOverflow', () => {
    LegacyUnit.equal(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(10, 10, 10, 10)), { x: 0, y: 0 });
    LegacyUnit.equal(ClientRect.getOverflow(rect(10, 10, 20, 20), rect(15, 15, 10, 10)), { x: 0, y: 0 });
    LegacyUnit.equal(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(5, 10, 10, 10)), { x: -5, y: 0 });
    LegacyUnit.equal(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(10, 5, 10, 10)), { x: 0, y: -5 });
    LegacyUnit.equal(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(15, 10, 10, 10)), { x: 5, y: 0 });
    LegacyUnit.equal(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(10, 15, 10, 10)), { x: 0, y: 5 });
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
