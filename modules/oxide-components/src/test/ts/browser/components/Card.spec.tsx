import * as Card from 'oxide-components/components/card/Card';
import { Button, UniverseProvider } from 'oxide-components/main';
import * as Bem from 'oxide-components/utils/Bem';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

describe('browser.components.CardTest', () => {
  const getIcon = vi.fn((icon: string) => `<svg id="${icon}"></svg>`);
  const mockUniverse = {
    getIcon,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        <UniverseProvider resources={mockUniverse}>
          {children}
        </UniverseProvider>
      </div>
    );
  };

  describe('Rendering Tests', () => {
    it('Should render with default props', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card');
      expect(card).toBeTruthy();
    });

    it('Should render all child sections (header, body, actions)', async () => {
      const { getByText } = render(
        <Card.Root>
          <Card.Header>Test Header</Card.Header>
          <Card.Body>Test Body</Card.Body>
          <Card.Actions>
            <button>Skip</button>
          </Card.Actions>
        </Card.Root>,
        { wrapper }
      );

      expect(getByText('Test Header').element()).toBeTruthy();
      expect(getByText('Test Body').element()).toBeTruthy();
      expect(getByText('Skip').element()).toBeTruthy();
    });

    it('Should apply custom className', async () => {
      const { container } = render(
        <Card.Root className="custom-class">
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card');
      expect(card?.className).toContain('custom-class');
    });

    it('Should render header with title prop', async () => {
      const { getByText } = render(
        <Card.Root>
          <Card.Header title="Title Prop" />
        </Card.Root>,
        { wrapper }
      );

      expect(getByText('Title Prop').element()).toBeTruthy();
    });

    it('Should render header with children when title is not provided', async () => {
      const { getByText } = render(
        <Card.Root>
          <Card.Header>
            <span>Custom Header Content</span>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      expect(getByText('Custom Header Content').element()).toBeTruthy();
    });
  });

  describe('State Tests', () => {
    it('Should apply selected CSS class when active is true', async () => {
      const { container } = render(
        <Card.Root active={true}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card');
      expect(card?.className).toContain('tox-card--selected');
    });

    it('Should not apply selected CSS class when active is false', async () => {
      const { container } = render(
        <Card.Root active={false}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card');
      expect(card?.className).not.toContain('tox-card--selected');
    });
  });

  describe('Callback Tests', () => {
    it('Should call onSelect when card is clicked', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <Card.Root onSelect={onSelect}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      await userEvent.click(card);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('Should call onSelect when Enter key is pressed on active card', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <Card.Root onSelect={onSelect} active={true}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      card.focus();
      await userEvent.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('Should call onSelect when Space key is pressed on active card', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <Card.Root onSelect={onSelect} active={true}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      card.focus();
      await userEvent.keyboard('{ }');
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('Should not call onSelect on keyboard events when card is not active', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <Card.Root onSelect={onSelect} active={false}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      card.focus();
      await userEvent.keyboard('{Enter}');
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('Should call action button callbacks', async () => {
      const onSkip = vi.fn();
      const onApply = vi.fn();
      const { getByText } = render(
        <Card.Root>
          <Card.Body>Content</Card.Body>
          <Card.Actions>
            <Button variant="outlined" onClick={onSkip}>Skip</Button>
            <Button variant="primary" onClick={onApply}>Apply</Button>
          </Card.Actions>
        </Card.Root>,
        { wrapper }
      );

      await userEvent.click(getByText('Skip'));
      expect(onSkip).toHaveBeenCalledTimes(1);

      await userEvent.click(getByText('Apply'));
      expect(onApply).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Tests', () => {
    it('Active card should have tabIndex 0', async () => {
      const { container } = render(
        <Card.Root active={true}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      expect(card.getAttribute('tabindex')).toBe('0');
    });

    it('Inactive card should have tabIndex -1', async () => {
      const { container } = render(
        <Card.Root active={false}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      expect(card.getAttribute('tabindex')).toBe('-1');
    });

    it('Card should have role="button"', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      expect(card.getAttribute('role')).toBe('button');
    });

    it('Card should have aria-pressed attribute', async () => {
      const { container, rerender } = render(
        <Card.Root active={false}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      expect(card.getAttribute('aria-pressed')).toBe('false');

      rerender(
        <Card.Root active={true}>
          <Card.Body>Content</Card.Body>
        </Card.Root>
      );

      expect(card.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Actions Layout Tests', () => {
    it('Should apply flex-start layout by default', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Actions>
            <button>Button 1</button>
          </Card.Actions>
        </Card.Root>,
        { wrapper }
      );

      const actions = container.querySelector('.tox-card__actions');
      expect(actions?.className).toContain('tox-card__actions--flex-start');
    });

    it('Should apply space-between layout when specified', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Actions layout="space-between">
            <button>Button 1</button>
          </Card.Actions>
        </Card.Root>,
        { wrapper }
      );

      const actions = container.querySelector('.tox-card__actions');
      expect(actions?.className).toContain('tox-card__actions--space-between');
    });
  });

  describe('Highlight Tests', () => {
    it('Should render highlight with added type', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Body>
            <Card.Highlight type="added">
              Added content
            </Card.Highlight>
          </Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const highlight = container.querySelector('.tox-card__highlight--added');
      expect(highlight).toBeTruthy();
    });

    it('Should render highlight with deleted type', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Body>
            <Card.Highlight type="deleted">
              Deleted content
            </Card.Highlight>
          </Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const highlight = container.querySelector('.tox-card__highlight--deleted');
      expect(highlight).toBeTruthy();
    });

    it('Should render highlight with modified type', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Body>
            <Card.Highlight type="modified">
              Modified content
            </Card.Highlight>
          </Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const highlight = container.querySelector('.tox-card__highlight--modified');
      expect(highlight).toBeTruthy();
    });
  });

  describe('Snapshot Tests', () => {
    it('Should match snapshot for default card', async () => {
      const { asFragment } = render(
        <Card.Root>
          <Card.Header>Test Header</Card.Header>
          <Card.Body>Test content</Card.Body>
          <Card.Actions>
            <Button variant="outlined">Skip</Button>
            <Button variant="outlined">Apply</Button>
          </Card.Actions>
        </Card.Root>,
        { wrapper }
      );

      expect(asFragment()).toMatchSnapshot('Default card');
    });

    it('Should match snapshot for selected card', async () => {
      const { asFragment } = render(
        <Card.Root active={true}>
          <Card.Header>Selected Card</Card.Header>
          <Card.Body>Selected content</Card.Body>
          <Card.Actions>
            <Button variant="outlined">Skip</Button>
            <Button variant="outlined">Apply</Button>
          </Card.Actions>
        </Card.Root>,
        { wrapper }
      );

      expect(asFragment()).toMatchSnapshot('Selected card');
    });
  });
});
