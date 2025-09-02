import { assert } from 'chai';
import { describe, it } from 'mocha';

import { validateModuleStructure } from 'ephox/oxide-icons-tools/core/ModuleValidator';

describe('oxide-icons-tools.core.ModuleValidator', () => {
  it('should validate a correct ES module', () => {
    const code = `
      export const getAll = () => ({
        'test-icon': '<svg></svg>'
      });
    `;

    const result = validateModuleStructure(code);
    assert.isTrue(result.isValid);
    assert.isEmpty(result.errors);
  });

  it('should validate return type if specified', () => {
    const code = `
      export const getAll = (): string => ({
        'test-icon': '<svg></svg>'
      });
    `;

    const result = validateModuleStructure(code);
    assert.isFalse(result.isValid);
    assert.include(result.errors, 'getAll should return Record<string, string>');
  });

  it('should validate missing getAll export', () => {
    const code = `
      const getAll = () => ({
        'test-icon': '<svg></svg>'
      });
    `;

    const result = validateModuleStructure(code);
    assert.isFalse(result.isValid);
    assert.include(result.errors, 'Module must export a getAll function');
  });

  it('should validate getAll is a function', () => {
    const code = `
      export const getAll = {
        'test-icon': '<svg></svg>'
      };
    `;

    const result = validateModuleStructure(code);
    assert.isFalse(result.isValid);
    assert.include(result.errors, 'getAll should be a function');
  });
});