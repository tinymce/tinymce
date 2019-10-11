import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Rect from 'tinymce/core/api/geom/Rect';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.geom.RectTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.test('relativePosition', function () {
    const sourceRect = Rect.create(0, 0, 20, 30),
      targetRect = Rect.create(10, 20, 40, 50),
      tests = [
        // Only test a few of them all would be 81
        ['tl-tl', 10, 20, 20, 30],
        ['tc-tc', 20, 20, 20, 30],
        ['tr-tr', 30, 20, 20, 30],
        ['cl-cl', 10, 30, 20, 30],
        ['cc-cc', 20, 30, 20, 30],
        ['cr-cr', 30, 30, 20, 30],
        ['bl-bl', 10, 40, 20, 30],
        ['bc-bc', 20, 40, 20, 30],
        ['br-br', 30, 40, 20, 30],
        ['tr-tl', 50, 20, 20, 30],
        ['br-bl', 50, 40, 20, 30]
      ];

    Tools.each(tests, function (item: any[]) {
      LegacyUnit.deepEqual(
        Rect.relativePosition(sourceRect, targetRect, item[0]),
        Rect.create(item[1], item[2], item[3], item[4]),
        item[0] as string
      );
    });
  });

  suite.test('findBestRelativePosition', function () {
    const sourceRect = Rect.create(0, 0, 20, 30),
      targetRect = Rect.create(10, 20, 40, 50),
      tests = [
        [['tl-tl'], 5, 15, 100, 100, 'tl-tl'],
        [['tl-tl'], 20, 30, 100, 100, null],
        [['tl-tl', 'tr-tl'], 20, 20, 100, 100, 'tr-tl'],
        [['tl-bl', 'tr-tl', 'bl-tl'], 10, 20, 40, 100, 'bl-tl']
      ];

    Tools.each(tests, function (item: any[]) {
      LegacyUnit.equal(
        Rect.findBestRelativePosition(sourceRect, targetRect, Rect.create(item[1], item[2], item[3], item[4]), item[0]),
        item[5],
        item[5]
      );
    });
  });

  suite.test('inflate', function () {
    LegacyUnit.deepEqual(Rect.inflate(Rect.create(10, 20, 30, 40), 5, 10), Rect.create(5, 10, 40, 60));
  });

  suite.test('intersect', function () {
    LegacyUnit.equal(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 20, 30, 40)), { x: 10, y: 20, w: 30, h: 40 });
    LegacyUnit.equal(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(15, 25, 30, 40)), { x: 15, y: 25, w: 25, h: 35 });
    LegacyUnit.equal(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(15, 25, 5, 5)), { x: 15, y: 25, w: 5, h: 5 });
    LegacyUnit.equal(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(0, 10, 5, 5)), null);
    LegacyUnit.equal(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(45, 20, 5, 5)), null);
    LegacyUnit.equal(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 65, 5, 5)), null);
    LegacyUnit.equal(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(40, 20, 30, 40)), { x: 40, y: 20, w: 0, h: 40 });
    LegacyUnit.equal(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 60, 30, 40)), { x: 10, y: 60, w: 30, h: 0 });
  });

  suite.test('clamp', function () {
    LegacyUnit.deepEqual(
      Rect.clamp(Rect.create(10, 20, 30, 40), Rect.create(10, 20, 30, 40)),
      Rect.create(10, 20, 30, 40)
    );

    LegacyUnit.deepEqual(
      Rect.clamp(Rect.create(5, 20, 30, 40), Rect.create(10, 20, 30, 40)),
      Rect.create(10, 20, 25, 40)
    );

    LegacyUnit.deepEqual(
      Rect.clamp(Rect.create(5, 20, 30, 40), Rect.create(10, 20, 30, 40), true),
      Rect.create(10, 20, 30, 40)
    );
  });

  suite.test('create', function () {
    LegacyUnit.deepEqual(Rect.create(10, 20, 30, 40), { x: 10, y: 20, w: 30, h: 40 });
  });

  suite.test('fromClientRect', function () {
    LegacyUnit.deepEqual(Rect.fromClientRect({ left: 10, top: 20, width: 30, height: 40, bottom: 60, right: 40 }), { x: 10, y: 20, w: 30, h: 40 });
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
