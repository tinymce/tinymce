import { Fun } from '@ephox/katamari';
import * as Card from 'oxide-components/components/card/Card';
import { AutoResizingTextarea, Button, ExpandableBox, UniverseProvider } from 'oxide-components/main';
import * as Bem from 'oxide-components/utils/Bem';
import { useState, type FC } from 'react';
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
        <Card.CardList defaultFocusedIndex={0}>
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
        <Card.CardList defaultFocusedIndex={1}>
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
        <Card.CardList defaultFocusedIndex={0}>
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
        <Card.CardList defaultSelectedIndex={0}>
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
        <Card.CardList defaultSelectedIndex={0}>
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

    it('TINY-13459: Should update focused card styling when focusedIndex changes (controlled)', async () => {
      const onFocusedIndexChange = vi.fn();
      const { container, rerender } = render(
        <Card.CardListController focusedIndex={0} onFocusedIndexChange={onFocusedIndexChange}>
          <Card.CardList>
            <Card.Root index={0}>
              <Card.Body>Card 1</Card.Body>
            </Card.Root>
            <Card.Root index={1}>
              <Card.Body>Card 2</Card.Body>
            </Card.Root>
          </Card.CardList>
        </Card.CardListController>,
        { wrapper }
      );

      let cards = container.querySelectorAll('.tox-card') as NodeListOf<HTMLElement>;
      expect(cards[0].className).toContain('tox-card--selected');
      expect(cards[1].className).not.toContain('tox-card--selected');

      rerender(
        <Card.CardListController focusedIndex={1} onFocusedIndexChange={onFocusedIndexChange}>
          <Card.CardList>
            <Card.Root index={0}>
              <Card.Body>Card 1</Card.Body>
            </Card.Root>
            <Card.Root index={1}>
              <Card.Body>Card 2</Card.Body>
            </Card.Root>
          </Card.CardList>
        </Card.CardListController>
      );

      cards = container.querySelectorAll('.tox-card') as NodeListOf<HTMLElement>;
      expect(cards[0].className).not.toContain('tox-card--selected');
      expect(cards[1].className).toContain('tox-card--selected');
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('TINY-13459: Should navigate between cards with arrow keys (controlled)', async () => {
      const onFocusedIndexChange = vi.fn();
      const { container } = render(
        <Card.CardListController focusedIndex={0} onFocusedIndexChange={onFocusedIndexChange}>
          <Card.CardList>
            <Card.Root index={0}>
              <Card.Body>Card 1</Card.Body>
            </Card.Root>
            <Card.Root index={1}>
              <Card.Body>Card 2</Card.Body>
            </Card.Root>
            <Card.Root index={2}>
              <Card.Body>Card 3</Card.Body>
            </Card.Root>
          </Card.CardList>
        </Card.CardListController>,
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
        <Card.CardList defaultFocusedIndex={1} onSelectCard={onSelectCard}>
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
        <Card.CardList defaultFocusedIndex={0}>
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
        <Card.CardList defaultFocusedIndex={0} defaultSelectedIndex={0}>
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
        <Card.CardList defaultFocusedIndex={0} defaultSelectedIndex={1} ariaLabel="Review suggestions">
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

  describe('Skeleton Tests', () => {
    it('TINY-13458: Should render skeleton with default props', async () => {
      const { container } = render(<Card.Root loading />, { wrapper });
      const skeleton = container.querySelector('.tox-card.tox-skeleton');
      expect(skeleton).toBeTruthy();
      expect(skeleton?.querySelectorAll(Bem.elementSelector('tox-skeleton', 'line')).length).toBe(2); // 1 body + 1 actions
    });

    it('TINY-13458: Should render skeleton with custom line count', async () => {
      const { container } = render(<Card.Root loading />, { wrapper });
      const skeleton = container.querySelector('.tox-card.tox-skeleton');
      // The skeleton always renders 2 lines: 1 for body, 1 for actions (hardcoded)
      expect(skeleton?.querySelectorAll(Bem.elementSelector('tox-skeleton', 'line')).length).toBe(2);
    });

    it('TINY-13458: Should be hidden from accessibility tree', async () => {
      const { container } = render(<Card.Root loading />, { wrapper });
      const skeleton = container.querySelector('.tox-card.tox-skeleton');
      expect(skeleton?.getAttribute('aria-busy')).toBe('true');
    });

    it('TINY-13458: Should have tox-skeleton class for animation inheritance', async () => {
      const { container } = render(<Card.Root loading />, { wrapper });
      const skeleton = container.querySelector('.tox-card');
      expect(skeleton?.className).toContain('tox-skeleton');
    });

    it('TINY-13458: Should have proper card structure with body and actions', async () => {
      const { container } = render(<Card.Root loading />, { wrapper });
      const body = container.querySelector('.tox-card__body');
      const actions = container.querySelector('.tox-card__actions');
      expect(body).toBeTruthy();
      expect(actions).toBeTruthy();
    });
  });

  describe('Header Tests', () => {
    it('TINYMCE-14722: Should render Card.HeaderContent', async () => {
      const { getByText, container } = render(
        <Card.Root>
          <Card.Header>
            <Card.HeaderContent>
              <span>Left content</span>
            </Card.HeaderContent>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      expect(getByText('Left content').element(), 'HeaderContent children should render').toBeTruthy();
      expect(
        container.querySelector(Bem.elementSelector('tox-card', 'header-content')),
        'HeaderContent should use tox-card__header-content class'
      ).toBeTruthy();
    });

    it('TINYMCE-14722: Should render Card.HeaderActions', async () => {
      const { getByText, container } = render(
        <Card.Root>
          <Card.Header>
            <Card.HeaderActions>
              <button>Action</button>
            </Card.HeaderActions>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      expect(getByText('Action').element(), 'HeaderActions children should render').toBeTruthy();
      expect(
        container.querySelector(Bem.elementSelector('tox-card', 'header-actions')),
        'HeaderActions should use tox-card__header-actions class'
      ).toBeTruthy();
    });

    it('TINYMCE-14722: Should render both HeaderContent and HeaderActions', async () => {
      const { getByText } = render(
        <Card.Root>
          <Card.Header>
            <Card.HeaderContent>
              <span>Content</span>
            </Card.HeaderContent>
            <Card.HeaderActions>
              <button>Action</button>
            </Card.HeaderActions>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      expect(getByText('Content').element(), 'HeaderContent should render alongside HeaderActions').toBeTruthy();
      expect(getByText('Action').element(), 'HeaderActions should render alongside HeaderContent').toBeTruthy();
    });

    it('TINYMCE-14722: Should apply hover-visible class by default', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Header>
            <Card.HeaderActions>
              <button>Action</button>
            </Card.HeaderActions>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      const headerActions = container.querySelector(Bem.elementSelector('tox-card', 'header-actions'));
      expect(
        headerActions?.className,
        'Default visibilityMode should apply hover-visible modifier'
      ).toContain('tox-card__header-actions--hover-visible');
    });

    it('TINYMCE-14722: Should apply always-visible class when visibilityMode is always', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Header>
            <Card.HeaderActions visibilityMode="always">
              <button>Action</button>
            </Card.HeaderActions>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      const headerActions = container.querySelector(Bem.elementSelector('tox-card', 'header-actions'));
      expect(
        headerActions?.className,
        'visibilityMode always should apply always-visible modifier'
      ).toContain('tox-card__header-actions--always-visible');
    });

    it('TINYMCE-14722: Should apply on-focus class when visibilityMode is focus', async () => {
      const { container } = render(
        <Card.Root>
          <Card.Header>
            <Card.HeaderActions visibilityMode="focus">
              <button>Action</button>
            </Card.HeaderActions>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      const headerActions = container.querySelector(Bem.elementSelector('tox-card', 'header-actions'));
      expect(
        headerActions?.className,
        'visibilityMode focus should apply on-focus modifier'
      ).toContain('tox-card__header-actions--on-focus');
    });

    it('TINYMCE-14722: Should apply hover-visible class to HeaderActions', () => {
      const { container } = render(
        <Card.Root selected={true}>
          <Card.Header>
            <Card.HeaderContent>
              <span>Content</span>
            </Card.HeaderContent>
            <Card.HeaderActions visibilityMode="hover">
              <button>Action</button>
            </Card.HeaderActions>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      const headerActions = container.querySelector(Bem.elementSelector('tox-card', 'header-actions')) as HTMLElement;

      expect(headerActions, 'HeaderActions element should exist').toBeTruthy();
      expect(headerActions.className, 'HeaderActions should have hover-visible modifier class').toContain('tox-card__header-actions--hover-visible');
      expect(headerActions.querySelector('button'), 'HeaderActions button child should render').toBeTruthy();
    });

    it('TINYMCE-14722: Should render HeaderActions without HeaderContent', () => {
      const { container } = render(
        <Card.Root selected={true}>
          <Card.Header>
            <Card.HeaderActions visibilityMode="always">
              <button>Action</button>
            </Card.HeaderActions>
          </Card.Header>
        </Card.Root>,
        { wrapper }
      );

      const header = container.querySelector(Bem.elementSelector('tox-card', 'header')) as HTMLElement;
      const headerActions = container.querySelector(Bem.elementSelector('tox-card', 'header-actions')) as HTMLElement;
      const headerContent = container.querySelector(Bem.elementSelector('tox-card', 'header-content'));

      expect(header, 'Header element should exist').toBeTruthy();
      expect(headerActions, 'HeaderActions element should exist').toBeTruthy();
      expect(headerContent, 'HeaderContent should not exist').toBeFalsy();
      expect(headerActions.querySelector('button'), 'HeaderActions button child should render').toBeTruthy();
    });
  });

  describe('Expansion Tests', () => {
    it('TINYMCE-14723: Should render Expansion with collapsed content by default', async () => {
      const { container, getByRole } = render(
        <Card.Root>
          <Card.Body>Body</Card.Body>
          <Card.Expansion open={false} onOpenChange={Fun.noop}>
            <Card.ExpansionTrigger>
              <button type="button">Provide feedback</button>
            </Card.ExpansionTrigger>
            <Card.ExpansionContent>
              <span>Feedback editor</span>
            </Card.ExpansionContent>
          </Card.Expansion>
        </Card.Root>,
        { wrapper }
      );

      const expansion = container.querySelector(Bem.elementSelector('tox-card', 'expansion'));
      const content = container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'));
      const trigger = getByRole('button', { name: 'Provide feedback' });

      expect(expansion, 'Expansion root should render').toBeTruthy();
      expect(content, 'Expansion content should render').toBeTruthy();
      expect(
        content?.className,
        'Content should have collapsed modifier by default'
      ).toContain('tox-card__expansion-content--collapsed');
      expect(trigger.element().getAttribute('aria-expanded'), 'Trigger should be collapsed').toBe('false');
      expect(content?.getAttribute('aria-hidden'), 'Content should be aria-hidden when collapsed').toBe('true');
    });

    it('TINYMCE-14723: Should expand content when trigger is clicked', async () => {
      const TestComponent: FC = () => {
        const [ open, setOpen ] = useState(false);
        return (
          <Card.Root>
            <Card.Expansion open={open} onOpenChange={setOpen}>
              <Card.ExpansionTrigger>
                <button type="button">Provide feedback</button>
              </Card.ExpansionTrigger>
              <Card.ExpansionContent>
                <span>Feedback editor</span>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { container, getByRole } = render(<TestComponent />, { wrapper });

      const trigger = getByRole('button', { name: 'Provide feedback' });
      await userEvent.click(trigger);

      const content = container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'));
      expect(trigger.element().getAttribute('aria-expanded'), 'Trigger should be expanded after click').toBe('true');
      expect(
        content?.className,
        'Content should have expanded modifier after click'
      ).toContain('tox-card__expansion-content--expanded');
      expect(content?.getAttribute('aria-hidden'), 'Content should not be aria-hidden when expanded').toBe('false');
    });

    it('TINYMCE-14723: Should toggle expansion with Enter key', async () => {
      const TestComponent: FC = () => {
        const [ open, setOpen ] = useState(false);
        return (
          <Card.Root>
            <Card.Expansion open={open} onOpenChange={setOpen}>
              <Card.ExpansionTrigger>
                <button type="button">Add comment...</button>
              </Card.ExpansionTrigger>
              <Card.ExpansionContent>
                <span>Reply editor</span>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { container, getByRole } = render(<TestComponent />, { wrapper });

      const trigger = getByRole('button', { name: 'Add comment...' });
      trigger.element().focus();
      await userEvent.keyboard('{Enter}');

      const content = container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'));
      expect(trigger.element().getAttribute('aria-expanded'), 'Enter should expand the trigger').toBe('true');
      expect(
        content?.className,
        'Enter should apply expanded content class'
      ).toContain('tox-card__expansion-content--expanded');
    });

    it('TINYMCE-14723: Should support controlled open state', async () => {
      const onOpenChange = vi.fn();
      const { container, rerender, getByRole } = render(
        <Card.Root>
          <Card.Expansion open={false} onOpenChange={onOpenChange}>
            <Card.ExpansionTrigger>
              <button type="button">2 replies</button>
            </Card.ExpansionTrigger>
            <Card.ExpansionContent>
              <span>Nested replies</span>
            </Card.ExpansionContent>
          </Card.Expansion>
        </Card.Root>,
        { wrapper }
      );

      let content = container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'));
      expect(content?.className, 'Controlled closed should be collapsed').toContain('tox-card__expansion-content--collapsed');

      await userEvent.click(getByRole('button', { name: '2 replies' }));
      expect(onOpenChange, 'Controlled mode should notify parent').toHaveBeenCalledWith(true);

      rerender(
        <Card.Root>
          <Card.Expansion open={true} onOpenChange={onOpenChange}>
            <Card.ExpansionTrigger>
              <button type="button">2 replies</button>
            </Card.ExpansionTrigger>
            <Card.ExpansionContent>
              <span>Nested replies</span>
            </Card.ExpansionContent>
          </Card.Expansion>
        </Card.Root>
      );

      content = container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'));
      expect(content?.className, 'Controlled open should be expanded').toContain('tox-card__expansion-content--expanded');
      expect(
        getByRole('button', { name: '2 replies' }).element().getAttribute('aria-expanded'),
        'Controlled open should set aria-expanded'
      ).toBe('true');
    });

    it('TINYMCE-14723: Should wire aria-controls between trigger and content', async () => {
      const { container, getByRole } = render(
        <Card.Root>
          <Card.Expansion open={false} onOpenChange={Fun.noop}>
            <Card.ExpansionTrigger>
              <button type="button">Provide feedback</button>
            </Card.ExpansionTrigger>
            <Card.ExpansionContent>
              <span>Feedback editor</span>
            </Card.ExpansionContent>
          </Card.Expansion>
        </Card.Root>,
        { wrapper }
      );

      const trigger = getByRole('button', { name: 'Provide feedback' }).element();
      const content = container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'));
      const controlsId = trigger.getAttribute('aria-controls');

      expect(controlsId, 'Trigger should have aria-controls').toBeTruthy();
      expect(content?.id, 'Content id should match aria-controls').toBe(controlsId);
      expect(content?.getAttribute('role'), 'Content should have role region').toBe('region');
    });

    it('TINYMCE-14723: Should support nested Expansion for comment reply composer', async () => {
      const TestComponent: FC = () => {
        const [ outerOpen, setOuterOpen ] = useState(true);
        const [ innerOpen, setInnerOpen ] = useState(false);
        return (
          <Card.Root>
            <Card.Expansion open={outerOpen} onOpenChange={setOuterOpen}>
              <Card.ExpansionTrigger>
                <button type="button">2 replies</button>
              </Card.ExpansionTrigger>
              <Card.ExpansionContent>
                <span>Existing reply</span>
                <Card.Expansion open={innerOpen} onOpenChange={setInnerOpen}>
                  <Card.ExpansionTrigger>
                    <button type="button">Add comment...</button>
                  </Card.ExpansionTrigger>
                  <Card.ExpansionContent>
                    <span>Nested reply editor</span>
                  </Card.ExpansionContent>
                </Card.Expansion>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { getByRole, getByText } = render(<TestComponent />, { wrapper });

      expect(getByText('Existing reply').element(), 'Outer expansion content should be visible').toBeTruthy();

      const addComment = getByRole('button', { name: 'Add comment...' });
      expect(addComment.element().getAttribute('aria-expanded'), 'Nested trigger starts collapsed').toBe('false');

      await userEvent.click(addComment);
      expect(addComment.element().getAttribute('aria-expanded'), 'Nested trigger should expand').toBe('true');
      expect(getByText('Nested reply editor').element(), 'Nested content should render').toBeTruthy();
    });

    it('TINYMCE-14723: Should not select card when Expansion trigger is activated', async () => {
      const onSelect = vi.fn();
      const { getByRole } = render(
        <Card.CardList>
          <Card.Root index={0} onSelect={onSelect}>
            <Card.Expansion open={false} onOpenChange={Fun.noop}>
              <Card.ExpansionTrigger>
                <button type="button">Provide feedback</button>
              </Card.ExpansionTrigger>
              <Card.ExpansionContent>
                <span>Editor</span>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      await userEvent.click(getByRole('button', { name: 'Provide feedback' }));
      expect(onSelect, 'Card onSelect should not fire when clicking Expansion trigger').not.toHaveBeenCalled();
    });

    it('TINYMCE-14723: Should toggle expansion with Space key', async () => {
      const TestComponent: FC = () => {
        const [ open, setOpen ] = useState(false);
        return (
          <Card.Root>
            <Card.Expansion open={open} onOpenChange={setOpen}>
              <Card.ExpansionTrigger>
                <button type="button">Provide feedback</button>
              </Card.ExpansionTrigger>
              <Card.ExpansionContent>
                <span>Feedback editor</span>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { container, getByRole } = render(<TestComponent />, { wrapper });

      const trigger = getByRole('button', { name: 'Provide feedback' });
      trigger.element().focus();
      await userEvent.keyboard('{ }');

      const content = container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'));
      expect(trigger.element().getAttribute('aria-expanded'), 'Space should expand the trigger').toBe('true');
      expect(
        content?.className,
        'Space should apply expanded content class'
      ).toContain('tox-card__expansion-content--expanded');
    });

    it('TINYMCE-14723: Provide feedback pattern should reveal textarea for typing', async () => {
      const FeedbackComposer: FC = () => {
        const [ open, setOpen ] = useState(false);
        const [ feedback, setFeedback ] = useState('');

        return (
          <Card.Root>
            <Card.Expansion open={open} onOpenChange={setOpen}>
              {!open && (
                <Card.ExpansionTrigger>
                  <button type="button">Provide feedback</button>
                </Card.ExpansionTrigger>
              )}
              <Card.ExpansionContent>
                <AutoResizingTextarea
                  value={feedback}
                  onChange={setFeedback}
                  placeholder="Provide feedback..."
                />
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { getByRole, getByPlaceholder } = render(<FeedbackComposer />, { wrapper });

      await userEvent.click(getByRole('button', { name: 'Provide feedback' }));

      const textarea = getByPlaceholder('Provide feedback...');
      expect(textarea.element(), 'Textarea should be available after Provide feedback').toBeTruthy();

      await userEvent.type(textarea, 'Test feedback');
      expect(
        (textarea.element() as HTMLTextAreaElement).value,
        'Typed feedback should appear in the textarea'
      ).toBe('Test feedback');
    });

    it('TINYMCE-14723: Provide feedback pattern should hide trigger while composer is open', async () => {
      const FeedbackComposer: FC = () => {
        const [ open, setOpen ] = useState(false);

        return (
          <Card.Root>
            <Card.Expansion open={open} onOpenChange={setOpen}>
              {!open && (
                <Card.ExpansionTrigger>
                  <button type="button">Provide feedback</button>
                </Card.ExpansionTrigger>
              )}
              <Card.ExpansionContent>
                <span>Feedback editor</span>
                <button type="button" onClick={() => setOpen(false)}>Cancel</button>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { getByRole, getByText, container } = render(<FeedbackComposer />, { wrapper });

      await userEvent.click(getByRole('button', { name: 'Provide feedback' }));

      expect(
        container.querySelector('button[aria-expanded]'),
        'Provide feedback trigger should be removed while composer is open'
      ).toBeNull();
      expect(getByText('Feedback editor').element(), 'Composer content should be visible').toBeTruthy();
    });

    it('TINYMCE-14723: Cancel should collapse the provide feedback composer', async () => {
      const FeedbackComposer: FC = () => {
        const [ open, setOpen ] = useState(false);
        const [ feedback, setFeedback ] = useState('');

        return (
          <Card.Root>
            <Card.Expansion open={open} onOpenChange={setOpen}>
              {!open && (
                <Card.ExpansionTrigger>
                  <button type="button">Provide feedback</button>
                </Card.ExpansionTrigger>
              )}
              <Card.ExpansionContent>
                <AutoResizingTextarea
                  value={feedback}
                  onChange={setFeedback}
                  placeholder="Provide feedback..."
                />
                <button
                  type="button"
                  onClick={() => {
                    setFeedback('');
                    setOpen(false);
                  }}
                >
                  Cancel
                </button>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { getByRole, getByPlaceholder, container } = render(<FeedbackComposer />, { wrapper });

      await userEvent.click(getByRole('button', { name: 'Provide feedback' }));
      await userEvent.type(getByPlaceholder('Provide feedback...'), 'Draft');
      await userEvent.click(getByRole('button', { name: 'Cancel' }));

      expect(
        getByRole('button', { name: 'Provide feedback' }).element(),
        'Provide feedback trigger should return after Cancel'
      ).toBeTruthy();
      expect(
        container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'))?.className,
        'Composer should be collapsed after Cancel'
      ).toContain('tox-card__expansion-content--collapsed');
      expect(
        container.querySelector(Bem.elementSelector('tox-card', 'expansion-content'))?.getAttribute('aria-hidden'),
        'Collapsed composer should be aria-hidden'
      ).toBe('true');
    });

    it('TINYMCE-14723: Add comment pattern should open reply composer inside expanded replies', async () => {
      const CommentThread: FC = () => {
        const [ repliesOpen, setRepliesOpen ] = useState(true);
        const [ replyOpen, setReplyOpen ] = useState(false);
        const [ reply, setReply ] = useState('');

        return (
          <Card.Root>
            <Card.Expansion open={repliesOpen} onOpenChange={setRepliesOpen}>
              <Card.ExpansionTrigger>
                <button type="button">2 replies</button>
              </Card.ExpansionTrigger>
              <Card.ExpansionContent>
                <span>Existing reply</span>
                <Card.Expansion open={replyOpen} onOpenChange={setReplyOpen}>
                  {!replyOpen && (
                    <Card.ExpansionTrigger>
                      <button type="button">Add comment...</button>
                    </Card.ExpansionTrigger>
                  )}
                  <Card.ExpansionContent>
                    <AutoResizingTextarea
                      value={reply}
                      onChange={setReply}
                      placeholder="Add comment..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReply('');
                        setReplyOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                  </Card.ExpansionContent>
                </Card.Expansion>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { getByRole, getByPlaceholder, getByText, container } = render(<CommentThread />, { wrapper });

      expect(getByText('Existing reply').element(), 'Replies should be visible when outer expansion is open').toBeTruthy();
      expect(
        getByRole('button', { name: 'Add comment...' }).element(),
        'Add comment trigger should be visible before opening composer'
      ).toBeTruthy();

      await userEvent.click(getByRole('button', { name: 'Add comment...' }));

      expect(
        Array.from(container.querySelectorAll('button')).some((button) => button.textContent === 'Add comment...'),
        'Add comment trigger should be hidden while composer is open'
      ).toBe(false);

      const textarea = getByPlaceholder('Add comment...');
      await userEvent.type(textarea, 'My reply');
      expect(
        (textarea.element() as HTMLTextAreaElement).value,
        'Reply text should be typed into the composer'
      ).toBe('My reply');
    });

    it('TINYMCE-14723: Cancel on nested comment composer should keep replies expansion open', async () => {
      const CommentThread: FC = () => {
        const [ repliesOpen, setRepliesOpen ] = useState(true);
        const [ replyOpen, setReplyOpen ] = useState(false);

        return (
          <Card.Root>
            <Card.Expansion open={repliesOpen} onOpenChange={setRepliesOpen}>
              <Card.ExpansionTrigger>
                <button type="button">2 replies</button>
              </Card.ExpansionTrigger>
              <Card.ExpansionContent>
                <span>Existing reply</span>
                <Card.Expansion open={replyOpen} onOpenChange={setReplyOpen}>
                  {!replyOpen && (
                    <Card.ExpansionTrigger>
                      <button type="button">Add comment...</button>
                    </Card.ExpansionTrigger>
                  )}
                  <Card.ExpansionContent>
                    <span>Reply editor</span>
                    <button type="button" onClick={() => setReplyOpen(false)}>Cancel</button>
                  </Card.ExpansionContent>
                </Card.Expansion>
              </Card.ExpansionContent>
            </Card.Expansion>
          </Card.Root>
        );
      };

      const { getByRole, getByText, container } = render(<CommentThread />, { wrapper });

      await userEvent.click(getByRole('button', { name: 'Add comment...' }));
      await userEvent.click(getByRole('button', { name: 'Cancel' }));

      expect(getByText('Existing reply').element(), 'Outer replies content should remain visible after Cancel').toBeTruthy();
      expect(
        getByRole('button', { name: 'Add comment...' }).element(),
        'Add comment trigger should return after Cancel'
      ).toBeTruthy();
      expect(
        getByRole('button', { name: '2 replies' }).element().getAttribute('aria-expanded'),
        'Outer replies expansion should stay open after Cancel'
      ).toBe('true');

      const expansionContents = container.querySelectorAll(Bem.elementSelector('tox-card', 'expansion-content'));
      expect(
        expansionContents[0]?.className,
        'Outer expansion content should remain expanded'
      ).toContain('tox-card__expansion-content--expanded');
      expect(
        expansionContents[1]?.className,
        'Inner composer should be collapsed after Cancel'
      ).toContain('tox-card__expansion-content--collapsed');
    });

    it('TINYMCE-14723: Collapsed nested composer should stay aria-hidden while replies are expanded', async () => {
      const { container, getByRole } = render(
        <Card.Root>
          <Card.Expansion open={true} onOpenChange={Fun.noop}>
            <Card.ExpansionTrigger>
              <button type="button">2 replies</button>
            </Card.ExpansionTrigger>
            <Card.ExpansionContent>
              <span>Existing reply</span>
              <Card.Expansion open={false} onOpenChange={Fun.noop}>
                <Card.ExpansionTrigger>
                  <button type="button">Add comment...</button>
                </Card.ExpansionTrigger>
                <Card.ExpansionContent>
                  <button type="button">Save reply</button>
                </Card.ExpansionContent>
              </Card.Expansion>
            </Card.ExpansionContent>
          </Card.Expansion>
        </Card.Root>,
        { wrapper }
      );

      const expansionContents = container.querySelectorAll(Bem.elementSelector('tox-card', 'expansion-content'));
      expect(
        expansionContents[1]?.getAttribute('aria-hidden'),
        'Nested composer should be aria-hidden while collapsed'
      ).toBe('true');
      expect(
        expansionContents[1]?.hasAttribute('inert'),
        'Nested composer should be inert while collapsed so it cannot be interacted with'
      ).toBe(true);
      expect(
        getByRole('button', { name: 'Add comment...' }).element().getAttribute('aria-expanded'),
        'Add comment trigger should report collapsed'
      ).toBe('false');
    });
  });

  describe('Loading State Tests', () => {
    it('TINY-13458: Should show skeleton content when loading is true', async () => {
      const { container } = render(
        <Card.Root loading={true} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );
      const card = container.querySelector('.tox-card');
      expect(card?.className).toContain('tox-skeleton');
      expect(card?.querySelectorAll('.tox-skeleton__line').length).toBe(2);
    });

    it('TINY-13458: Should show children when loading is false', async () => {
      const { getByText } = render(
        <Card.Root loading={false} index={0}>
          <Card.Body>Loaded Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );
      expect(getByText('Loaded Content').element()).toBeTruthy();
    });

    it('TINY-13458: Should have aria-busy when loading', async () => {
      const { container } = render(
        <Card.Root loading={true} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );
      const card = container.querySelector('.tox-card');
      expect(card?.getAttribute('aria-busy')).toBe('true');
    });

    it('TINY-13458: Should not have aria-busy when not loading', async () => {
      const { container } = render(
        <Card.Root loading={false} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );
      const card = container.querySelector('.tox-card');
      expect(card?.getAttribute('aria-busy')).toBe('false');
    });

    it('TINY-13458: Should not trigger onSelect when loading', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <Card.Root loading={true} onSelect={onSelect} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );
      const card = container.querySelector('.tox-card') as HTMLElement;
      // Card has pointer-events: none when loading, so onClick should be undefined
      // Try to trigger click event directly
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('TINY-13458: Should trigger onSelect when not loading', async () => {
      const onSelect = vi.fn();
      const { container } = render(
        <Card.Root loading={false} onSelect={onSelect} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );
      const card = container.querySelector('.tox-card') as HTMLElement;
      await userEvent.click(card);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('TINY-13458: Should transition from loading to loaded state', async () => {
      const { container, rerender } = render(
        <Card.Root loading={true} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );

      // Initially loading
      let card = container.querySelector('.tox-card');
      expect(card?.className).toContain('tox-skeleton');
      expect(card?.querySelectorAll('.tox-skeleton__line').length).toBe(2);

      // Rerender with loading=false
      rerender(
        <Card.Root loading={false} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>
      );

      // Now loaded
      card = container.querySelector('.tox-card');
      expect(card?.className).not.toContain('tox-skeleton');
      expect(container.textContent).toContain('Content');
    });

    it('TINY-14077: Should not apply selected CSS class while Card is loading', async () => {
      const { container } = render(
        <Card.CardList defaultFocusedIndex={1}>
          <Card.Root loading={true} selected={true} index={0}>
            <Card.Body>Content</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const card = container.querySelector(Bem.blockSelector('tox-card'));
      expect(card?.className).toContain(Bem.block('tox-skeleton'));
      expect(card?.className).not.toContain(Bem.block('tox-card', { selected: true }));
    });

    it('TINY-14077: Should apply selected CSS class while card is not loading', async () => {
      const { container } = render(
        <Card.CardList defaultFocusedIndex={1}>
          <Card.Root loading={false} selected={true} index={0}>
            <Card.Body>Content</Card.Body>
          </Card.Root>
        </Card.CardList>,
        { wrapper }
      );

      const card = container.querySelector(Bem.blockSelector('tox-card'));
      expect(card?.className).toContain(Bem.block('tox-card', { selected: true }));
    });

    it('TINY-14077: Should not be able to programmatically focus Card while loading', async () => {
      const { container } = render(
        <Card.Root loading={true} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );
      const card = container.querySelector<HTMLElement>(Bem.blockSelector('tox-card'));
      card?.focus();
      expect(document.activeElement).not.toBe(card);
    });

    it('TINY-14077: Should be able to programmatically focus Card while not loading', async () => {
      const { container } = render(
        <Card.Root loading={false} index={0}>
          <Card.Body>Content</Card.Body>
        </Card.Root>,
        { wrapper }
      );
      const card = container.querySelector<HTMLElement>(Bem.blockSelector('tox-card'));
      card?.focus();
      expect(document.activeElement).toBe(card);
    });
  });
});
