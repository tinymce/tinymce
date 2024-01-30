
import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Presets from 'tinymce/core/schema/Presets';
import * as SchemaElementSets from 'tinymce/core/schema/SchemaElementSets';
import * as SchemaTypes from 'tinymce/core/schema/SchemaTypes';

describe('atomic.tinymce.core.schema.PresetsTest', () => {
  const testPreset = (testCase: { type: SchemaTypes.SchemaType; preset: string; expectedSet: keyof SchemaElementSets.ElementSets<readonly string[]> }) => {
    const arraySets = SchemaElementSets.getElementSets(testCase.type);

    const expectedNames = arraySets[testCase.expectedSet];
    const actualNames = Presets.getElementsPreset(testCase.type, testCase.preset).getOrDie();

    assert.deepEqual(actualNames, expectedNames);

    // Should not be mutable
    assert.throw(() => {
      (actualNames as string[]).push('foo');
    });
  };

  context('html5', () => {
    it('HTML5 blocks', () => testPreset({ type: 'html5', preset: 'blocks', expectedSet: 'blockContent' }));
    it('HTML5 phrasing', () => testPreset({ type: 'html5', preset: 'phrasing', expectedSet: 'phrasingContent' }));
    it('HTML5 flow', () => testPreset({ type: 'html5', preset: 'flow', expectedSet: 'flowContent' }));
  });

  context('html5-strict', () => {
    it('HTML5 blocks', () => testPreset({ type: 'html5-strict', preset: 'blocks', expectedSet: 'blockContent' }));
    it('HTML5 phrasing', () => testPreset({ type: 'html5-strict', preset: 'phrasing', expectedSet: 'phrasingContent' }));
    it('HTML5 flow', () => testPreset({ type: 'html5-strict', preset: 'flow', expectedSet: 'flowContent' }));
  });

  context('html4', () => {
    it('HTML5 blocks', () => testPreset({ type: 'html4', preset: 'blocks', expectedSet: 'blockContent' }));
    it('HTML5 phrasing', () => testPreset({ type: 'html4', preset: 'phrasing', expectedSet: 'phrasingContent' }));
    it('HTML5 flow', () => testPreset({ type: 'html4', preset: 'flow', expectedSet: 'flowContent' }));
  });
});

