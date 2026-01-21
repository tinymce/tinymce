import * as Card from 'oxide-components/components/card/Card';
import { Button, ExpandableBox, UniverseProvider } from 'oxide-components/main';
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
    it('TINY-13459: Should render with default props', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card');
      expect(card).toBeTruthy();
    });

    it('TINY-13459: Should render all child sections (header, body, actions)', async () => {
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

    it('TINY-13459: Should apply custom className', async () => {
      const { container } = render(
        <Card.Root className="custom-class">
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card');
      expect(card?.className).toContain('custom-class');
    });

    it('TINY-13459: Should render header with title prop', async () => {
      const { getByText } = render(
        <Card.Root>
          <Card.Header title="Title Prop" />
        </Card.Root>,
        { wrapper }
      );

      expect(getByText('Title Prop').element()).toBeTruthy();
    });

    it('TINY-13459: Should render header with children when title is not provided', async () => {
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
    it('TINY-13459: Should apply selected CSS class when card is focused in list', async () => {
      const { container } = render(
        <Card.CardList focusedIndex={0}>
          <Card.Root index={0}>
            <Card.Body>Content</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card');
      expect(card?.className).toContain('tox-card--selected');
    });

    it('TINY-13459: Should not apply selected CSS class when card is not focused', async () => {
      const { container } = render(
        <Card.CardList focusedIndex={1}>
          <Card.Root index={0}>
            <Card.Body>Content</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Other Card</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card');
      expect(card?.className).not.toContain('tox-card--selected');
    });
  });

  describe('Callback Tests', () => {
    it('TINY-13459: Should call onSelect when card is clicked in list', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <Card.CardList>
          <Card.Root index={0} onSelect={onSelect}>
            <Card.Body>Content</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      await userEvent.click(card);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('TINY-13459: Should call action button callbacks', async () => {
      const onSkip = vi.fn();
      const onApply = vi.fn();
      const { getByText } = render(
        <Card.CardList>
          <Card.Root index={0}>
            <Card.Body>Content</Card.Body>
            <Card.Actions>
              <Button variant="outlined" onClick={onSkip}>Skip</Button>
              <Button variant="primary" onClick={onApply}>Apply</Button>
            </Card.Actions>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      await userEvent.click(getByText('Skip'));
      expect(onSkip).toHaveBeenCalledTimes(1);

      await userEvent.click(getByText('Apply'));
      expect(onApply).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Tests - Card Component', () => {
    it('TINY-13459: Cards should always have tabIndex -1 (roving tabindex managed by CardList)', async () => {
      const { container } = render(
        <Card.CardList focusedIndex={0}>
          <Card.Root index={0}>
            <Card.Body>Content</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      expect(card.getAttribute('tabindex')).toBe('-1');
    });

    it('TINY-13459: Cards should have role="option" when in list', async () => {
      const { container } = render(
        <Card.CardList>
          <Card.Root index={0}>
            <Card.Body>Content</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const card = container.querySelector('.tox-card') as HTMLElement;
      expect(card.getAttribute('role')).toBe('option');
    });

    it('TINY-13459: Cards should have aria-selected attribute when in list', async () => {
      const { container } = render(
        <Card.CardList selectedIndex={0}>
          <Card.Root index={0}>
            <Card.Body>Content</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Other</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const cards = container.querySelectorAll('.tox-card');
      expect(cards[0].getAttribute('aria-selected')).toBe('true');
      expect(cards[1].getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('Accessibility Tests - CardList', () => {
    it('TINY-13459: CardList should have role="listbox"', async () => {
      const { container } = render(
        <Card.CardList ariaLabel="Test cards">
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const list = container.querySelector('.tox-card-list') as HTMLElement;
      expect(list.getAttribute('role')).toBe('listbox');
      expect(list.getAttribute('aria-label')).toBe('Test cards');
    });

    it('TINY-13459: Cards in list should have role="option"', async () => {
      const { container } = render(
        <Card.CardList>
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const cards = container.querySelectorAll('.tox-card');
      expect(cards[0].getAttribute('role')).toBe('option');
      expect(cards[1].getAttribute('role')).toBe('option');
    });

    it('TINY-13459: Cards in list should have aria-selected attribute', async () => {
      const { container } = render(
        <Card.CardList selectedIndex={0}>
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const cards = container.querySelectorAll('.tox-card');
      expect(cards[0].getAttribute('aria-selected')).toBe('true');
      expect(cards[1].getAttribute('aria-selected')).toBe('false');
    });

    it('TINY-13459: Should apply focused styling to first card by default', async () => {
      const { container } = render(
        <Card.CardList defaultFocusedIndex={0}>
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
          <Card.Root index={2}>
            <Card.Body>Card 3</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const cards = container.querySelectorAll('.tox-card') as NodeListOf<HTMLElement>;
      expect(cards[0].className).toContain('tox-card--selected');
      expect(cards[1].className).not.toContain('tox-card--selected');
      expect(cards[2].className).not.toContain('tox-card--selected');
    });

    it('TINY-13459: Should update focused card styling when focusedIndex changes', async () => {
      const { container, rerender } = render(
        <Card.CardList focusedIndex={0}>
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      let cards = container.querySelectorAll('.tox-card') as NodeListOf<HTMLElement>;
      expect(cards[0].className).toContain('tox-card--selected');
      expect(cards[1].className).not.toContain('tox-card--selected');

      rerender(
        <Card.CardList focusedIndex={1}>
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
        </Card.CardList>
      );

      cards = container.querySelectorAll('.tox-card') as NodeListOf<HTMLElement>;
      expect(cards[0].className).not.toContain('tox-card--selected');
      expect(cards[1].className).toContain('tox-card--selected');
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('TINY-13459: Should navigate between cards with arrow keys', async () => {
      const onFocusedIndexChange = vi.fn();
      const { container } = render(
        <Card.CardList focusedIndex={0} onFocusedIndexChange={onFocusedIndexChange}>
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
          <Card.Root index={2}>
            <Card.Body>Card 3</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const firstCard = container.querySelectorAll('.tox-card')[0] as HTMLElement;
      firstCard.focus();

      await userEvent.keyboard('{ArrowDown}');
      expect(firstCard).toBeTruthy();
    });

    it('TINY-13459: Should call onSelectCard when card is clicked in list', async () => {
      const onSelectCard = vi.fn();
      const { container } = render(
        <Card.CardList onSelectCard={onSelectCard}>
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const secondCard = container.querySelectorAll('.tox-card')[1] as HTMLElement;
      await userEvent.click(secondCard);
      expect(onSelectCard).toHaveBeenCalledWith(1);
    });

    it('TINY-13459: Should call onSelectCard when Enter is pressed on focused card', async () => {
      const onSelectCard = vi.fn();
      const { container } = render(
        <Card.CardList focusedIndex={1} onSelectCard={onSelectCard}>
          <Card.Root index={0}>
            <Card.Body>Card 1</Card.Body>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Body>Card 2</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const secondCard = container.querySelectorAll('.tox-card')[1] as HTMLElement;
      secondCard.focus();
      await userEvent.keyboard('{Enter}');
      expect(onSelectCard).toHaveBeenCalledWith(1);
    });

    it('TINY-13459: Should allow buttons inside card to respond to Space key', async () => {
      const onButtonClick = vi.fn();
      const onCardSelect = vi.fn();
      const { getByRole } = render(
        <Card.CardList>
          <Card.Root index={0} onSelect={onCardSelect}>
            <Card.Body>
              <button onClick={onButtonClick}>Test Button</button>
            </Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const button = getByRole('button', { name: 'Test Button' });
      button.element().focus();
      await userEvent.keyboard('{Space}');

      expect(onButtonClick).toHaveBeenCalledTimes(1);
      expect(onCardSelect).not.toHaveBeenCalled();
    });

    it('TINY-13459: Should allow buttons inside card to respond to Enter key', async () => {
      const onButtonClick = vi.fn();
      const onCardSelect = vi.fn();
      const { getByRole } = render(
        <Card.CardList>
          <Card.Root index={0} onSelect={onCardSelect}>
            <Card.Body>
              <button onClick={onButtonClick}>Test Button</button>
            </Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const button = getByRole('button', { name: 'Test Button' });
      button.element().focus();
      await userEvent.keyboard('{Enter}');

      expect(onButtonClick).toHaveBeenCalledTimes(1);
      expect(onCardSelect).not.toHaveBeenCalled();
    });

    it('TINY-13459: Should allow multiple buttons inside card to work independently', async () => {
      const onSkip = vi.fn();
      const onApply = vi.fn();
      const onCardSelect = vi.fn();
      const { getByRole } = render(
        <Card.CardList>
          <Card.Root index={0} onSelect={onCardSelect}>
            <Card.Body>Content</Card.Body>
            <Card.Actions>
              <Button variant="outlined" onClick={onSkip}>Skip</Button>
              <Button variant="primary" onClick={onApply}>Apply</Button>
            </Card.Actions>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const skipButton = getByRole('button', { name: 'Skip' });
      skipButton.element().focus();
      await userEvent.keyboard('{Enter}');
      expect(onSkip).toHaveBeenCalledTimes(1);
      expect(onCardSelect).not.toHaveBeenCalled();

      const applyButton = getByRole('button', { name: 'Apply' });
      applyButton.element().focus();
      await userEvent.keyboard('{Space}');
      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onCardSelect).not.toHaveBeenCalled();
    });

    it('TINY-13459: ExpandableBox toggle button should work with keyboard in card', async () => {
      const onToggle = vi.fn();
      const onCardSelect = vi.fn();
      const longContent = 'Lorem ipsum dolor sit amet, '.repeat(50);

      const { getByRole } = render(
        <Card.CardList>
          <Card.Root index={0} onSelect={onCardSelect}>
            <Card.Body>
              <ExpandableBox onToggle={onToggle} maxHeight={50}>
                {longContent}
              </ExpandableBox>
            </Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      // Find the expand button (should be visible due to overflow)
      const expandButton = getByRole('button', { name: /expand/i });
      expandButton.element().focus();

      // Press Enter on the expand button
      await userEvent.keyboard('{Enter}');
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onCardSelect).not.toHaveBeenCalled();

      // Press Space on the expand button
      await userEvent.keyboard('{Space}');
      expect(onToggle).toHaveBeenCalledTimes(2);
      expect(onCardSelect).not.toHaveBeenCalled();
    });
  });

  describe('Actions Layout Tests', () => {
    it('TINY-13459: Should apply flex-start layout by default', async () => {
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

    it('TINY-13459: Should apply space-between layout when specified', async () => {
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
    it('TINY-13459: Should render highlight with added type', async () => {
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

    it('TINY-13459: Should render highlight with deleted type', async () => {
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

    it('TINY-13459: Should render highlight with modified type', async () => {
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
    it('TINY-13459: Should match snapshot for focused card in list', async () => {
      const { asFragment } = render(
        <Card.CardList focusedIndex={0}>
          <Card.Root index={0}>
            <Card.Header>Test Header</Card.Header>
            <Card.Body>Test content</Card.Body>
            <Card.Actions>
              <Button variant="outlined">Skip</Button>
              <Button variant="outlined">Apply</Button>
            </Card.Actions>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      expect(asFragment()).toMatchSnapshot('Focused card');
    });

    it('TINY-13459: Should match snapshot for selected card in list', async () => {
      const { asFragment } = render(
        <Card.CardList selectedIndex={0} focusedIndex={0}>
          <Card.Root index={0}>
            <Card.Header>Selected Card</Card.Header>
            <Card.Body>Selected content</Card.Body>
            <Card.Actions>
              <Button variant="outlined">Skip</Button>
              <Button variant="outlined">Apply</Button>
            </Card.Actions>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      expect(asFragment()).toMatchSnapshot('Selected card');
    });

    it('TINY-13459: Should match snapshot for CardList', async () => {
      const { asFragment } = render(
        <Card.CardList focusedIndex={0} selectedIndex={1} ariaLabel="Review suggestions">
          <Card.Root index={0}>
            <Card.Header>First Card</Card.Header>
            <Card.Body>First content</Card.Body>
            <Card.Actions>
              <Button variant="outlined">Skip</Button>
              <Button variant="outlined">Apply</Button>
            </Card.Actions>
          </Card.Root>
          <Card.Root index={1}>
            <Card.Header>Second Card</Card.Header>
            <Card.Body>Second content</Card.Body>
            <Card.Actions>
              <Button variant="outlined">Skip</Button>
              <Button variant="outlined">Apply</Button>
            </Card.Actions>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      expect(asFragment()).toMatchSnapshot('CardList with multiple cards');
    });
  });
});
