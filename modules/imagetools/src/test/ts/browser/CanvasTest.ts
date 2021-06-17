import { UnitTest } from '@ephox/bedrock-client';

import * as Assertion from 'ephox/imagetools/test/Assertion';
import * as Canvas from 'ephox/imagetools/util/Canvas';

UnitTest.test('CanvasTest', () => {
  const assertDimensions = (label: string, w: number, h: number, canvas: HTMLCanvasElement) => {
    Assertion.assertEq(w, canvas.width, label + ' width');
    Assertion.assertEq(h, canvas.height, label + ' height');
  };

  (() => {
    const canvas = Canvas.create(320, 200);

    assertDimensions('create', 320, 200, canvas);
  })();

  (() => {
    const canvas = Canvas.create(320, 200);
    Canvas.resize(canvas, 420, 300);
    assertDimensions('resize', 420, 300, canvas);
  })();

  (() => {
    const canvas = Canvas.create(320, 200);
    const context = Canvas.get2dContext(canvas);
    Assertion.assertEq(true, !!context.drawImage, 'Draw image should be defined');
  })();

  //   QUnit.test('get2dContext', function() {
  //     const canvas = imagetools.Canvas.create(320, 200);
  //     const context = imagetools.Canvas.get2dContext(canvas);

  //     QUnit.ok(!!context.drawImage);
  //   });
  // })();
});
