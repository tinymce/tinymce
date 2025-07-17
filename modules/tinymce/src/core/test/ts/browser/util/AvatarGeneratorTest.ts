import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import AvatarGenerator from 'tinymce/core/api/util/AvatarGenerator';

describe('browser.tinymce.core.util.AvatarGeneratorTest', () => {
  const assertValidSvg = (svg: string) => {
    assert.isString(svg, 'Should be a string');
    assert.isTrue(svg.startsWith('<svg'), 'Should start with svg tag');
    assert.isTrue(svg.includes('xmlns="http://www.w3.org/2000/svg"'), 'Should have xmlns attribute');
  };

  const assertValidImageSource = (src: string) => {
    assert.isString(src, 'Should be a string');
    assert.isTrue(src.startsWith('data:image/svg+xml,'), 'Should be a data URI');
    assert.isTrue(src.includes(encodeURIComponent('<svg')), 'Should contain encoded SVG');
  };

  it('Should create an avatar builder', () => {
    const builder = AvatarGenerator.create('John Doe');
    assert.isObject(builder, 'Should return a builder object');
    assert.isFunction(builder.getSvg, 'Should have getSvg method');
    assert.isFunction(builder.getImageSource, 'Should have getImageSource method');
  });

  it('Should generate SVG with default options', () => {
    const svg = AvatarGenerator.create('John Doe').getSvg();
    assertValidSvg(svg);
    assert.isTrue(svg.includes('>J<'), 'Should contain first character');
    assert.isTrue(svg.includes('height="36"'), 'Should use default size');
  });

  it('Should generate image source with default options', () => {
    const src = AvatarGenerator.create('John Doe').getImageSource();
    assertValidImageSource(src);
  });

  it('Should respect custom color option', () => {
    const color = '#FF0000';
    const svg = AvatarGenerator.create('John Doe', { color }).getSvg();
    assertValidSvg(svg);
    assert.isTrue(svg.includes(`fill="${color}"`), 'Should use custom color');
  });

  it('Should respect custom size option', () => {
    const size = 48;
    const svg = AvatarGenerator.create('John Doe', { size }).getSvg();
    assertValidSvg(svg);
    assert.isTrue(svg.includes(`height="${size}"`), 'Should use custom size');
    assert.isTrue(svg.includes(`width="${size}"`), 'Should use custom size');
  });

  it('Should handle empty name', () => {
    const svg = AvatarGenerator.create('').getSvg();
    assertValidSvg(svg);
  });

  it('Should handle unicode characters', () => {
    const svg = AvatarGenerator.create('🚀 Space').getSvg();
    assertValidSvg(svg);
    assert.isTrue(svg.includes('>🚀<') || svg.includes('>S<'), 'Should contain first character or fallback');
  });

  it('Should reuse options for both SVG and image source', () => {
    const builder = AvatarGenerator.create('John Doe', {
      color: '#FF0000',
      size: 48
    });

    const svg = builder.getSvg();
    const src = builder.getImageSource();

    assertValidSvg(svg);
    assertValidImageSource(src);
    assert.isTrue(svg.includes('fill="#FF0000"'), 'SVG should use custom color');
    assert.isTrue(svg.includes('height="48"'), 'SVG should use custom size');
    assert.isTrue(src.includes(encodeURIComponent(svg)), 'Image source should contain the same SVG');
  });
});
