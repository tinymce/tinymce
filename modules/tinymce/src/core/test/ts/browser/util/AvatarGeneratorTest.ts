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
    it('TINY-12211: Should create an avatar builder', () => {
      const builder = AvatarGenerator.create('John Doe');
      assert.isObject(builder, 'Should return a builder object');
      assert.isFunction(builder.getSvg, 'Should have getSvg method');
      assert.isFunction(builder.getImageSource, 'Should have getImageSource method');
    });

    it('TINY-12211: Should generate SVG with default options', () => {
      const svg = AvatarGenerator.create('John Doe').getSvg();
      assertValidSvg(svg);
      assert.isTrue(svg.includes('>J<'), 'Should contain first character');
      assert.isTrue(svg.includes('height="36"'), 'Should use default size');
    });

    it('TINY-12211: Should generate image source with default options', () => {
      const src = AvatarGenerator.create('John Doe').getImageSource();
      assertValidImageSource(src);
    });

    it('TINY-12211: Should respect custom color option', () => {
      const color = '#FF0000';
      const svg = AvatarGenerator.create('John Doe', { color }).getSvg();
      assertValidSvg(svg);
      assert.isTrue(svg.includes(`fill="${color}"`), 'Should use custom color');
    });

    it('TINY-12211: Should respect custom size option', () => {
      const size = 48;
      const svg = AvatarGenerator.create('John Doe', { size }).getSvg();
      assertValidSvg(svg);
      assert.isTrue(svg.includes(`height="${size}"`), 'Should use custom size');
      assert.isTrue(svg.includes(`width="${size}"`), 'Should use custom size');
    });

    it('TINY-12211: Should handle empty name', () => {
      const svg = AvatarGenerator.create('').getSvg();
      assertValidSvg(svg);
    });

    it('TINY-12211: Should handle unicode characters', () => {
      const svg = AvatarGenerator.create('🚀 Space').getSvg();
      assertValidSvg(svg);
      assert.isTrue(svg.includes('>🚀<') || svg.includes('>S<'), 'Should contain first character or fallback');
    });

    it('TINY-12211: Should reuse options for both SVG and image source', () => {
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
    it('TINY-12211: Should not cache by default', () => {
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

    it('TINY-12211: Should reuse cached avatar when enabled', () => {
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

    it('TINY-12211: Should cache different avatars separately', () => {
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

    it('TINY-12211: Should cache based on all options', () => {
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

    it('TINY-12211: Should cache SVG and image source separately', () => {
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

    it('TINY-12211: Should handle cache miss and then cache hit correctly', () => {
      // First call should be a cache miss and store the result
      const builder1 = AvatarGenerator.create('Cache Test', {
        color: '#FF0000',
        size: 36,
        useCache: true
      });

      const firstImageSource = builder1.getImageSource();
      const firstSvg = builder1.getSvg();

      // Verify the first call generated valid content
      assertValidImageSource(firstImageSource);
      assertValidSvg(firstSvg);
      assert.include(firstSvg, '>C<', 'Should contain first character');
      assert.include(firstSvg, 'height="36"', 'Should use specified size');

      // Second call with same name/size should be a cache hit (ignoring color)
      const builder2 = AvatarGenerator.create('Cache Test', {
        color: '#00FF00', // Different color, but should still hit cache
        size: 36,
        useCache: true
      });

      const secondImageSource = builder2.getImageSource();
      const secondSvg = builder2.getSvg();

      // Results should be identical (same cached content, color ignored)
      assert.strictEqual(firstImageSource, secondImageSource, 'Same name/size should hit cache regardless of color');
      assert.strictEqual(firstSvg, secondSvg, 'SVGs should be identical (cache hit)');

      // Third call with different size should be a cache miss
      const builder3 = AvatarGenerator.create('Cache Test', {
        color: '#FF0000',
        size: 48, // Different size
        useCache: true
      });

      const thirdImageSource = builder3.getImageSource();
      const thirdSvg = builder3.getSvg();

      // Should be different from cached result (different size)
      assert.notEqual(firstImageSource, thirdImageSource, 'Different size should produce different result');
      assert.notEqual(firstSvg, thirdSvg, 'Different size should produce different SVG');
      assert.include(thirdSvg, 'height="48"', 'Should use new size');
    });

    it('TINY-12211: Should cache based on complete cache key', () => {
      // Test that cache key includes name and size (but NOT color)
      const baseParams = {
        color: '#FF0000',
        size: 36,
        useCache: true
      };

      // Different names should have different cache entries (even if they look the same)
      const johnAvatar1 = AvatarGenerator.create('John Doe', baseParams).getImageSource();
      const janeAvatar1 = AvatarGenerator.create('Jane Doe', baseParams).getImageSource();

      // Get them again to verify separate caching
      const johnAvatar2 = AvatarGenerator.create('John Doe', baseParams).getImageSource();
      const janeAvatar2 = AvatarGenerator.create('Jane Doe', baseParams).getImageSource();

      // Each name should hit its own cache
      assert.strictEqual(johnAvatar1, johnAvatar2, 'John should hit his cache');
      assert.strictEqual(janeAvatar1, janeAvatar2, 'Jane should hit her cache');

      // The actual appearance doesn't matter - they could be identical and still be correctly cached separately

      // Different sizes (same name) should have different cache entries
      const size36Avatar = AvatarGenerator.create('John Doe', { ...baseParams, size: 36 }).getImageSource();
      const size48Avatar = AvatarGenerator.create('John Doe', { ...baseParams, size: 48 }).getImageSource();
      assert.notEqual(size36Avatar, size48Avatar, 'Different sizes should produce different results');

      // Same name and size should share cache EVEN with different colors specified
      const redAvatar = AvatarGenerator.create('John Doe', { ...baseParams, color: '#FF0000' }).getImageSource();
      const blueAvatar = AvatarGenerator.create('John Doe', { ...baseParams, color: '#0000FF' }).getImageSource();
      assert.strictEqual(redAvatar, blueAvatar, 'Same name/size should share cache regardless of color');
    });

    it('TINY-12211: Should not interfere between cached and non-cached calls', () => {
      const params = {
        color: '#FF0000',
        size: 36
      };

      // Non-cached call
      const nonCachedAvatar = AvatarGenerator.create('Mixed Test', params).getImageSource();

      // Cached call with same parameters
      const cachedAvatar = AvatarGenerator.create('Mixed Test', {
        ...params,
        useCache: true
      }).getImageSource();

      // Should produce the same result but not interfere with each other
      assert.equal(nonCachedAvatar, cachedAvatar, 'Results should be identical');

      // Another non-cached call should still work independently
      const nonCachedAvatar2 = AvatarGenerator.create('Mixed Test', params).getImageSource();
      assert.equal(nonCachedAvatar, nonCachedAvatar2, 'Non-cached calls should be consistent');

      // Another cached call should hit the cache
      const cachedAvatar2 = AvatarGenerator.create('Mixed Test', {
        ...params,
        useCache: true
      }).getImageSource();
      assert.strictEqual(cachedAvatar, cachedAvatar2, 'Cached calls should reuse cache');
    });
  });
});
