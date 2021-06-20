import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as ImageTransformations from 'ephox/imagetools/api/ImageTransformations';
import * as ResultConversions from 'ephox/imagetools/api/ResultConversions';

// Note: Can't assert the image data URI, as different OS/Browser/Hardware produce minor variations
describe('RotateTest', () => {
  // 25x50px image
  const image = document.createElement('img');
  image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAyCAYAAACpgnCWAAAAAXNSR0IArs4c6QAAAFVJREFUWEft0rEJwEAMBEGpP5funuwaNviPRvGCYLj9nnnn8K0nRRhX0RpcuJJAiq0LVxJIsXXhSgIpti5cSSDF1oUrCaTYunAlgRRbF64kkOIr6/oBmShosVsEUSoAAAAASUVORK5CYII=';

  const pRotate = async (angle: number) => {
    const ir = await ResultConversions.imageToImageResult(image);
    return await ImageTransformations.rotate(ir, angle);
  };

  it('TINY-7371: Rotate an image 90 degrees', async () => {
    const result = await pRotate(90);
    const canvas = await result.toCanvas();

    assert.equal(canvas.width, 50, 'Rotated image width');
    assert.equal(canvas.height, 25, 'Rotated image height');
  });

  it('TINY-7371: Rotate an image 180 degrees', async () => {
    const result = await pRotate(180);
    const canvas = await result.toCanvas();

    assert.equal(canvas.width, 25, 'Rotated image width');
    assert.equal(canvas.height, 50, 'Rotated image height');
  });

  it('TINY-7371: Rotate an image 270 degrees', async () => {
    const result = await pRotate(270);
    const canvas = await result.toCanvas();

    assert.equal(canvas.width, 50, 'Rotated image width');
    assert.equal(canvas.height, 25, 'Rotated image height');
  });

  it('TINY-7371: Rotate an image 13 degrees', async () => {
    const result = await pRotate(13);
    const canvas = await result.toCanvas();

    assert.equal(canvas.width, 36, 'Rotated image width');
    assert.equal(canvas.height, 55, 'Rotated image height');
  });

  it('TINY-7371: Rotate an image -30 degrees', async () => {
    const result = await pRotate(-30);
    const canvas = await result.toCanvas();

    assert.equal(canvas.width, 47, 'Rotated image width');
    assert.equal(canvas.height, 56, 'Rotated image height');
  });

  it('TINY-7371: Rotate an image 45 degrees', async () => {
    const result = await pRotate(45);
    const canvas = await result.toCanvas();

    assert.equal(canvas.width, 54, 'Rotated image width');
    assert.equal(canvas.height, 54, 'Rotated image height');
  });
});
