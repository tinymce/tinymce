import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import { useUniverse } from '../../../../main/ts/contexts/UniverseContext/Universe';
import { UniverseProvider } from '../../../../main/ts/contexts/UniverseContext/UniverseProvider';
import type { UniverseResources } from '../../../../main/ts/contexts/UniverseContext/UniverseTypes';

const createMockUniverse = (overrides?: Partial<UniverseResources>): UniverseResources => ({
  getIcon: (name: string) => `<svg data-icon="${name}">mock-${name}</svg>`,
  ...overrides
});

const TestComponent: React.FC<{ iconName: string }> = ({ iconName }) => {
  const { getIcon } = useUniverse();
  return <div data-testid="test-output" dangerouslySetInnerHTML={{ __html: getIcon(iconName) }} />;
};

describe('browser.contexts.UniverseTest', () => {
  describe('UniverseProvider', () => {
    it('TINY-13186: Should provide getIcon to child components', async () => {
      const mockUniverse = createMockUniverse();

      const screen = render(
        <UniverseProvider resources={mockUniverse}>
          <TestComponent iconName="chevron-down" />
        </UniverseProvider>
      );

      const output = screen.getByTestId('test-output');
      await expect.element(output).toContainHTML('data-icon="chevron-down"');
      await expect.element(output).toContainHTML('mock-chevron-down');
    });

    it('TINY-13186: Should throw an error when used outside of the UniverseProvider', () => {
      expect(() => {
        render(<TestComponent iconName="error-case" />);
      }).toThrow('useUniverse must be used within a UniverseProvider');
    });
  });
});
