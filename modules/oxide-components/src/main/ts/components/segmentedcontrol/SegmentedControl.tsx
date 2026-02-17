import {
  type InputHTMLAttributes,
  type KeyboardEvent,
  forwardRef,
  type FunctionComponent
} from 'react';

import * as Bem from '../../utils/Bem';

interface SegmentedControlProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onClick'> {
  readonly leftLabel: string;
  readonly rightLabel: string;
  readonly checked: boolean;
  readonly disabled?: boolean;
  onClick: () => void;
  onKeydown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const SegmentedControl: FunctionComponent<SegmentedControlProps> = forwardRef<HTMLInputElement, SegmentedControlProps>(
  ({
    leftLabel,
    rightLabel,
    checked,
    onClick,
    onKeyDown,
    name,
    disabled,
    ...rest
  }, ref) => {
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

    return (
      <div className={Bem.block('tox-segmented-control', { disabled })}>
        <input
          type='checkbox'
          ref={ref}
          checked={checked}
          onClick={onClick}
          onKeyDown={onKeyDown}
          name={name}
          disabled={disabled}
          aria-checked={checked}
          {...rest}
        />
        <span
          className={Bem.element('tox-segmented-control', 'segment', { active: !checked })}
          onClick={handleLeftSegmentClick}
        >
          {leftLabel}
        </span>
        <span
          className={Bem.element('tox-segmented-control', 'segment', { active: checked })}
          onClick={handleRightSegmentClick}
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