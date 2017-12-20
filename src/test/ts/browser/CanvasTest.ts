import Assertion from 'ephox/imagetools/test/Assertion';
import Canvas from 'ephox/imagetools/util/Canvas';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('CanvasTest', function() {
  var assertDimensions = function (label, w, h, canvas) {
    Assertion.assertEq(w, canvas.width, label + ' width');
    Assertion.assertEq(h, canvas.height, label + ' height');
  };

  (function () {
    var canvas = Canvas.create(320, 200);

    assertDimensions('create', 320, 200, canvas);
  })();

  (function () {
    var canvas = Canvas.create(320, 200);
    Canvas.resize(canvas, 420, 300);
    assertDimensions('resize', 420, 300, canvas);
  })();

  (function () {
    var canvas = Canvas.create(320, 200);
    var context = Canvas.get2dContext(canvas);
    Assertion.assertEq(true, !!context.drawImage, 'Draw image should be defined');
  })();

  //   QUnit.test('get2dContext', function() {
  //     var canvas = imagetools.Canvas.create(320, 200);
  //     var context = imagetools.Canvas.get2dContext(canvas);

  //     QUnit.ok(!!context.drawImage);
  //   });
  // })();
});

