import * as SegmentedControl from 'oxide-components/components/segmentedcontrol/SegmentedControl';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

describe('browser.components.SegmentedControl', () => {
  it('TINY-13470: Should render with correct initial value', async () => {
    const { container } = render(
      <SegmentedControl.Root value="diff" onChange={vi.fn()}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );

    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup).toBeVisible();

    const options = container.querySelectorAll('[role="radio"]');
    expect(options).toHaveLength(2);

    const diffOption = options[0] as HTMLElement;
    const previewOption = options[1] as HTMLElement;

    expect(diffOption.getAttribute('aria-checked')).toBe('true');
    expect(diffOption.getAttribute('tabindex')).toBe('0');
    expect(previewOption.getAttribute('aria-checked')).toBe('false');
    expect(previewOption.getAttribute('tabindex')).toBe('-1');
  });

  it('TINY-13470: Should call onChange when clicking inactive option', async () => {
    const onChangeSpy = vi.fn();

    const { container } = render(
      <SegmentedControl.Root value="diff" onChange={onChangeSpy}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );

    const options = container.querySelectorAll('[role="radio"]');
    const previewOption = options[1] as HTMLElement;

    await userEvent.click(previewOption);

    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith('preview');
  });

  it('TINY-13470: Should not call onChange when clicking active option', async () => {
    const onChangeSpy = vi.fn();

    const { container } = render(
      <SegmentedControl.Root value="diff" onChange={onChangeSpy}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );

    const options = container.querySelectorAll('[role="radio"]');
    const diffOption = options[0] as HTMLElement;

    await userEvent.click(diffOption);

    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('TINY-13470: Should update aria-checked when value changes', async () => {
    const TestComponent = () => {
      const [ value, setValue ] = React.useState('diff');

      return (
        <SegmentedControl.Root value={value} onChange={setValue}>
          <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
          <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
        </SegmentedControl.Root>
      );
    };

    const { container } = render(<TestComponent />);

    const options = container.querySelectorAll('[role="radio"]');
    const diffOption = options[0] as HTMLElement;
    const previewOption = options[1] as HTMLElement;

    expect(diffOption.getAttribute('aria-checked')).toBe('true');
    expect(previewOption.getAttribute('aria-checked')).toBe('false');

    await userEvent.click(previewOption);

    await expect.poll(() => previewOption.getAttribute('aria-checked')).toBe('true');
    await expect.poll(() => diffOption.getAttribute('aria-checked')).toBe('false');
    await expect.poll(() => previewOption.getAttribute('tabindex')).toBe('0');
    await expect.poll(() => diffOption.getAttribute('tabindex')).toBe('-1');
  });

  it('TINY-13470: Should work with three or more options', async () => {
    const onChangeSpy = vi.fn();

    const { container } = render(
      <SegmentedControl.Root value="view" onChange={onChangeSpy}>
        <SegmentedControl.Option value="view">View</SegmentedControl.Option>
        <SegmentedControl.Option value="edit">Edit</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );

    const options = container.querySelectorAll('[role="radio"]');
    expect(options).toHaveLength(3);

    const viewOption = options[0] as HTMLElement;
    const editOption = options[1] as HTMLElement;
    const previewOption = options[2] as HTMLElement;

    expect(viewOption.getAttribute('aria-checked')).toBe('true');
    expect(editOption.getAttribute('aria-checked')).toBe('false');
    expect(previewOption.getAttribute('aria-checked')).toBe('false');

    await userEvent.click(previewOption);

    expect(onChangeSpy).toHaveBeenCalledWith('preview');
  });

  it('TINY-13470: Should handle disabled state on root', async () => {
    const onChangeSpy = vi.fn();

    const { container } = render(
      <SegmentedControl.Root value="diff" onChange={onChangeSpy} disabled>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );

    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup?.getAttribute('aria-disabled')).toBe('true');

    const options = container.querySelectorAll('[role="radio"]');
    const diffOption = options[0] as HTMLElement;
    const previewOption = options[1] as HTMLElement;

    expect(diffOption.getAttribute('aria-disabled')).toBe('true');
    expect(diffOption.getAttribute('tabindex')).toBe('-1');
    expect(previewOption.getAttribute('aria-disabled')).toBe('true');
    expect(previewOption.getAttribute('tabindex')).toBe('-1');

    previewOption.click();

    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('TINY-13470: Should handle disabled state on individual option', async () => {
    const onChangeSpy = vi.fn();

    const { container } = render(
      <SegmentedControl.Root value="diff" onChange={onChangeSpy}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview" disabled>Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );

    const options = container.querySelectorAll('[role="radio"]');
    const diffOption = options[0] as HTMLElement;
    const previewOption = options[1] as HTMLElement;

    expect(diffOption.getAttribute('aria-disabled')).toBe('false');
    expect(previewOption.getAttribute('aria-disabled')).toBe('true');
    expect(previewOption.getAttribute('tabindex')).toBe('-1');

    previewOption.click();

    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('TINY-13470: Should apply custom className and aria-label', () => {
    const { container } = render(
      <SegmentedControl.Root
        value="diff"
        onChange={vi.fn()}
        className="custom-class"
        aria-label="Display mode"
      >
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );

    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup?.className).toContain('custom-class');
    expect(radiogroup?.getAttribute('aria-label')).toBe('Display mode');
  });
});
