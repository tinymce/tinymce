import { AutoResizingTextarea } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextarea';
import { computeRowMetrics, resizeTextarea } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextareaUtils';
import { Bem } from 'oxide-components/Main';
import { createRef, forwardRef, type FC, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

interface TestComponentProps {
  readonly hidden?: boolean;
  readonly initialValue?: string;
}

const TestComponent = forwardRef<HTMLTextAreaElement, TestComponentProps>(({ hidden, initialValue = '' }, ref) => (
  <div style={{ display: hidden ? 'none' : 'block' }}>
    <AutoResizingTextarea ref={ref} value={initialValue} />
  </div>
));

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={Bem.block('tox')}>
    <div style={{ width: '120px' }}>
      {children}
    </div>
  </div>
);

interface MountOptions extends TestComponentProps {
  readonly initialRows?: number;
  readonly pinnedHeight?: boolean;
}

const mountTextarea = ({ initialRows, pinnedHeight, ...props }: MountOptions = {}): HTMLTextAreaElement => {
  const ref = createRef<HTMLTextAreaElement>();
  render(<TestComponent ref={ref} {...props} />, { wrapper: Wrapper });
  if (!ref.current) {
    throw new Error('Expected textarea ref to be set after render');
  }
  if (initialRows !== undefined) {
    ref.current.rows = initialRows;
  }
  if (pinnedHeight) {
    ref.current.style.height = '40px';
    ref.current.style.boxSizing = 'border-box';
  }
  return ref.current;
};

describe('browser.components.autoresizingtextarea.AutoResizingTextareaUtils', () => {

  describe('computeRowMetrics', () => {
    it('TINY-12773: returns a positive height (>1) for a visible textarea', () => {
      const textarea = mountTextarea();
      expect(computeRowMetrics(textarea).lineHeight).toBeGreaterThan(1);
    });

    it('TINY-12773: returns a lineHeight of 1 as a fallback when the textarea has no layout (display:none ancestor)', () => {
      const textarea = mountTextarea({ hidden: true });
      expect(computeRowMetrics(textarea).lineHeight).toBe(1);
    });

    it('TINY-12773: falls back to the whole measurement as lineHeight when the height is pinned by CSS', () => {
      const textarea = mountTextarea({ pinnedHeight: true });
      const { lineHeight, padding } = computeRowMetrics(textarea);
      expect(lineHeight).toBeGreaterThan(1);
      expect(padding).toBe(0);
    });

    it('TINY-12773: restores the textarea\'s rows and value after measuring', () => {
      const textarea = mountTextarea({ initialValue: 'pre-existing content' });
      textarea.rows = 5;
      computeRowMetrics(textarea);
      expect(textarea.rows).toBe(5);
      expect(textarea.value).toBe('pre-existing content');
    });
  });

  describe('resizeTextarea', () => {
    it('TINY-12773: is a no-op when the textarea is hidden', () => {
      const textarea = mountTextarea({ hidden: true, initialRows: 3 });
      resizeTextarea({ textarea, minRows: 1, maxRows: 4, metrics: { lineHeight: 20, padding: 0 }});
      expect(textarea.rows).toBe(3);
    });

    it('TINY-12773: sets rows to minRows for empty content (one-row content clamped up)', () => {
      const textarea = mountTextarea({ initialValue: '' });
      const metrics = computeRowMetrics(textarea);
      resizeTextarea({ textarea, minRows: 3, maxRows: 5, metrics });
      expect(textarea.rows).toBe(3);
    });

    it('TINY-12773: grows rows to fit multi-line content within range', () => {
      // Three lines (two newlines).
      const textarea = mountTextarea({ initialValue: 'line1\nline2\nline3' });
      const metrics = computeRowMetrics(textarea);
      resizeTextarea({ textarea, minRows: 1, maxRows: 10, metrics });
      expect(textarea.rows).toBe(3);
    });

    it('TINY-12773: clamps to maxRows when content exceeds the limit', () => {
      const longContent = Array.from({ length: 50 }, (_, i) => `line${i}`).join('\n');
      const textarea = mountTextarea({ initialValue: longContent });
      const metrics = computeRowMetrics(textarea);
      resizeTextarea({ textarea, minRows: 1, maxRows: 4, metrics });
      expect(textarea.rows).toBe(4);
    });
  });
});
