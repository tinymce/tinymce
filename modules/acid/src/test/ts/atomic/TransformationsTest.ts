import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Transformations from 'ephox/acid/api/colour/Transformations';

describe('browser.acid.api.TransformationsTest', () => {
  it('TINY-8163: RGB with 0 Red converted to hex', () => {
    const input = 'rgb(0, 255, 255)';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#00FFFF');
  });

  it('TINY-8163: RGB with 0 Blue & Green converted to hex', () => {
    const input = 'rgb(255, 0, 0)';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#FF0000' );
  });

  it('TINY-8163: RGB with 0 Red & Blue converted to hex', () => {
    const input = 'rgb(0, 0, 255)';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('TINY-8163: RGB with Spaces converted to hex', () => {
    const input = 'rgb  (  0  , 0  , 255  )';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('TINY-8163: RGB with Extra Spaces converted to hex', () => {
    const input = '   rgb  (  0  , 0  , 255  )  ';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('TINY-8163: RGB with Uppercase chars converted to hex', () => {
    const input = 'RGB  (  0  , 0  , 255  )  ';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('TINY-8163: RGB with Extra Spaces and Uppercase chars converted to hex', () => {
    const input = '   RGB  (  0  , 0  , 255  )  ';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('TINY-8163: red is not converted to hex', () => {
    const input = 'red';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, 'red');
  });

  it('TINY-8163: Check if hex code remains the same', () => {
    const input = '#FF0';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#FF0');
  });

  it('TINY-8163: RGBA with Extra Spaces and Uppercase chars converted to hex', () => {
    const input = '   RGBA  (  0  , 0  , 255, 0.5  )  ';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('TINY-8163: RGBA with Extra Spaces converted to hex', () => {
    const input = '   rgba  (  0  , 0  , 255, 0.5  )  ';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('TINY-8163: RGBA with 0 Blue & Green converted to hex', () => {
    const input = 'rgba(255, 0, 0, 1)';
    const result = Transformations.rgbaToHexString(input);
    assert.equal(result, '#FF0000');
  });
});
