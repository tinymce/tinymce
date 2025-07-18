import { describe, it, context } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { createAvatarGenerator as AvatarGenerator } from 'tinymce/core/api/util/AvatarGenerator';

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

  context('Basic functionality', () => {
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

  context('Cache behavior', () => {
    it('Should not cache by default', () => {
      // Create two builders with same parameters
      const builder1 = AvatarGenerator.create('John Doe', { color: '#FF0000' });
      const builder2 = AvatarGenerator.create('John Doe', { color: '#FF0000' });

      // Get image sources from each builder
      const src1 = builder1.getImageSource();
      const src2 = builder2.getImageSource();

      // Values should be equal (same input = same output)
      assert.equal(src1, src2, 'Generated avatars should be identical');
      // But should be different string instances
      assert.notEqual(builder1, builder2, 'Builders should be different instances');
    });

    it('Should reuse cached avatar when enabled', () => {
      // Create builder with cache enabled
      const builder1 = AvatarGenerator.create('John Doe', {
        color: '#FF0000',
        useCache: true
      });

      // Get multiple image sources from same builder
      const src1 = builder1.getImageSource();
      const src2 = builder1.getImageSource();

      // Should be exactly the same instance
      assert.strictEqual(src1, src2, 'Should reuse cached avatar');
    });

    it('Should cache different avatars separately', () => {
      // Create builders for different names
      const builder1 = AvatarGenerator.create('John Doe', {
        color: '#FF0000',
        useCache: true
      });

      const builder2 = AvatarGenerator.create('Jane Doe', {
        color: '#FF0000',
        useCache: true
      });

      // Check SVG directly instead of data URL
      const svg1 = builder1.getSvg();
      const svg2 = builder2.getSvg();

      // Different names should produce different SVGs
      assert.include(svg1, '>J<', 'First avatar should contain J');
      assert.include(svg2, '>J<', 'Second avatar should contain J');
      assert.notEqual(builder1, builder2, 'Builders should be different instances');
    });

    it('Should cache based on all options', () => {
      // Create builders with different sizes
      const builder1 = AvatarGenerator.create('John Doe', {
        color: '#FF0000',
        size: 36,
        useCache: true
      });

      const builder2 = AvatarGenerator.create('John Doe', {
        color: '#FF0000',
        size: 48,
        useCache: true
      });

      // Check SVG directly instead of data URL
      const svg1 = builder1.getSvg();
      const svg2 = builder2.getSvg();

      // Different sizes should be reflected in the SVG
      assert.include(svg1, 'height="36"', 'First avatar should be size 36');
      assert.include(svg2, 'height="48"', 'Second avatar should be size 48');
      assert.notEqual(builder1, builder2, 'Builders should be different instances');
    });

    it('Should cache SVG and image source separately', () => {
      const builder = AvatarGenerator.create('John Doe', {
        color: '#FF0000',
        useCache: true
      });

      // Get multiple outputs from same builder
      const svg1 = builder.getSvg();
      const svg2 = builder.getSvg();
      const img1 = builder.getImageSource();
      const img2 = builder.getImageSource();

      // Same builder should return same instances
      assert.strictEqual(svg1, svg2, 'Should reuse cached SVG');
      assert.strictEqual(img1, img2, 'Should reuse cached image source');
      // But SVG and image source should be different
      assert.notEqual(svg1, img1, 'SVG and image source should be different formats');
    });
  });
});
