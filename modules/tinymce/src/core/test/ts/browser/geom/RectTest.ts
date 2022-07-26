import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Rect from 'tinymce/core/api/geom/Rect';
import Tools from 'tinymce/core/api/util/Tools';

describe('browser.tinymce.core.geom.RectTest', () => {
  it('relativePosition', () => {
    const sourceRect = Rect.create(0, 0, 20, 30);
    const targetRect = Rect.create(10, 20, 40, 50);
    const tests: Array<[ string, number, number, number, number ]> = [
      // Only test a few of them all would be 81
      [ 'tl-tl', 10, 20, 20, 30 ],
      [ 'tc-tc', 20, 20, 20, 30 ],
      [ 'tr-tr', 30, 20, 20, 30 ],
      [ 'cl-cl', 10, 30, 20, 30 ],
      [ 'cc-cc', 20, 30, 20, 30 ],
      [ 'cr-cr', 30, 30, 20, 30 ],
      [ 'bl-bl', 10, 40, 20, 30 ],
      [ 'bc-bc', 20, 40, 20, 30 ],
      [ 'br-br', 30, 40, 20, 30 ],
      [ 'tr-tl', 50, 20, 20, 30 ],
      [ 'br-bl', 50, 40, 20, 30 ]
    ];

    Tools.each(tests, (item) => {
      assert.deepEqual(
        Rect.relativePosition(sourceRect, targetRect, item[0]),
        Rect.create(item[1], item[2], item[3], item[4]),
        item[0] as string
      );
    });
  });

  it('findBestRelativePosition', () => {
    const sourceRect = Rect.create(0, 0, 20, 30);
    const targetRect = Rect.create(10, 20, 40, 50);
    const tests: Array<[ string[], number, number, number, number, string | null ]> = [
      [[ 'tl-tl' ], 5, 15, 100, 100, 'tl-tl' ],
      [[ 'tl-tl' ], 20, 30, 100, 100, null ],
      [[ 'tl-tl', 'tr-tl' ], 20, 20, 100, 100, 'tr-tl' ],
      [[ 'tl-bl', 'tr-tl', 'bl-tl' ], 10, 20, 40, 100, 'bl-tl' ]
    ];

    Tools.each(tests, (item) => {
      assert.equal(
        Rect.findBestRelativePosition(sourceRect, targetRect, Rect.create(item[1], item[2], item[3], item[4]), item[0]),
        item[5],
        String(item[5])
      );
    });
  });

  it('inflate', () => {
    assert.deepEqual(Rect.inflate(Rect.create(10, 20, 30, 40), 5, 10), Rect.create(5, 10, 40, 60));
  });

  it('intersect', () => {
    assert.deepEqual(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 20, 30, 40)), { x: 10, y: 20, w: 30, h: 40 });
    assert.deepEqual(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(15, 25, 30, 40)), { x: 15, y: 25, w: 25, h: 35 });
    assert.deepEqual(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(15, 25, 5, 5)), { x: 15, y: 25, w: 5, h: 5 });
    assert.isNull(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(0, 10, 5, 5)));
    assert.isNull(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(45, 20, 5, 5)));
    assert.isNull(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 65, 5, 5)));
    assert.deepEqual(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(40, 20, 30, 40)), { x: 40, y: 20, w: 0, h: 40 });
    assert.deepEqual(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 60, 30, 40)), { x: 10, y: 60, w: 30, h: 0 });
  });

  it('clamp', () => {
    assert.deepEqual(
      Rect.clamp(Rect.create(10, 20, 30, 40), Rect.create(10, 20, 30, 40)),
      Rect.create(10, 20, 30, 40)
    );

    assert.deepEqual(
      Rect.clamp(Rect.create(5, 20, 30, 40), Rect.create(10, 20, 30, 40)),
      Rect.create(10, 20, 25, 40)
    );

    assert.deepEqual(
      Rect.clamp(Rect.create(5, 20, 30, 40), Rect.create(10, 20, 30, 40), true),
      Rect.create(10, 20, 30, 40)
    );
  });

  it('create', () => {
    assert.deepEqual(Rect.create(10, 20, 30, 40), { x: 10, y: 20, w: 30, h: 40 });
  });

  it('fromClientRect', () => {
    const clientRect = { left: 10, top: 20, width: 30, height: 40, bottom: 60, right: 40 } as DOMRect;
    assert.deepEqual(Rect.fromClientRect(clientRect), { x: 10, y: 20, w: 30, h: 40 });
  });
});
