import { Type } from '@ephox/katamari';
import {
  forwardRef,
  type FunctionComponent,
  useRef,
  useEffect
} from 'react';

import * as Bem from '../../utils/Bem';

interface SegmentedControlProps {
  readonly leftLabel: string;
  readonly rightLabel: string;
  readonly checked: boolean;
  readonly disabled?: boolean;
  onClick: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const SegmentedControl: FunctionComponent<SegmentedControlProps> = forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({
    leftLabel,
    rightLabel,
    checked,
    onClick,
    onKeyDown,
    disabled
  }, ref) => {
    const leftSegmentRef = useRef<HTMLSpanElement>(null);
    const rightSegmentRef = useRef<HTMLSpanElement>(null);
    const shouldFocusLeft = useRef(false);
    const shouldFocusRight = useRef(false);

    useEffect(() => {
      if (shouldFocusLeft.current && Type.isNonNullable(leftSegmentRef.current)) {
        leftSegmentRef.current.focus();
        shouldFocusLeft.current = false;
      }
      if (shouldFocusRight.current && Type.isNonNullable(rightSegmentRef.current)) {
        rightSegmentRef.current.focus();
        shouldFocusRight.current = false;
      }
    }, [ checked ]);

    const handleLeftSegmentClick = () => {
      if (!disabled && checked) {
        onClick();
      }
    };

    const handleRightSegmentClick = () => {
      if (!disabled && !checked) {
        onClick();
      }
    };

    const handleLeftSegmentKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (checked) {
          onClick();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!checked) {
          shouldFocusRight.current = true;
          onClick();
        }
      } else if (Type.isFunction(onKeyDown)) {
        onKeyDown(e);
      }
    };

    const handleRightSegmentKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!checked) {
          onClick();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (checked) {
          shouldFocusLeft.current = true;
          onClick();
        }
      } else if (Type.isFunction(onKeyDown)) {
        onKeyDown(e);
      }
    };

    return (
      <div
        ref={ref}
        className={Bem.block('tox-segmented-control', { disabled })}
        role="radiogroup"
        aria-disabled={disabled}
      >
        <span
          ref={leftSegmentRef}
          className={Bem.element('tox-segmented-control', 'segment', { active: !checked })}
          role="radio"
          aria-checked={!checked}
          aria-disabled={disabled}
          tabIndex={!checked ? 0 : -1}
          onClick={handleLeftSegmentClick}
          onKeyDown={handleLeftSegmentKeyDown}
        >
          {leftLabel}
        </span>
        <span
          ref={rightSegmentRef}
          className={Bem.element('tox-segmented-control', 'segment', { active: checked })}
          role="radio"
          aria-checked={checked}
          aria-disabled={disabled}
          tabIndex={checked ? 0 : -1}
          onClick={handleRightSegmentClick}
          onKeyDown={handleRightSegmentKeyDown}
        >
          {rightLabel}
        </span>
      </div>
    );
  }
);

export {
  SegmentedControl
};