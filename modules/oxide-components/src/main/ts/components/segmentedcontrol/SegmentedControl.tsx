import { Arr, Optional, Type } from '@ephox/katamari';
import { Attribute, type SugarElement } from '@ephox/sugar';
import {
  createContext,
  forwardRef, type HTMLAttributes,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  Children,
  isValidElement,
  type ReactElement
} from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';
import * as Bem from '../../utils/Bem';

interface SegmentedControlContextValue {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly firstOptionValue: string | null;
}

interface SegmentedControlRootProps extends PropsWithChildren<Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>> {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
}

type SegmentedControlOptionProps = PropsWithChildren<{
  readonly value: string;
  readonly disabled?: boolean;
}>;

const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

const useSegmentedControlContext = (): SegmentedControlContextValue => {
  const context = useContext(SegmentedControlContext);
  if (!Type.isNonNullable(context)) {
    throw new Error('SegmentedControl.Option must be used within SegmentedControl.Root');
  }
  return context;
};

const Root = forwardRef<HTMLDivElement, SegmentedControlRootProps>(
  ({
    value,
    onChange,
    disabled,
    children,
    ...rest
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (Type.isNonNullable(ref)) {
        if (typeof ref === 'function') {
          ref(containerRef.current);
        } else if (typeof ref === 'object' && Type.isNonNullable(ref)) {
          ref.current = containerRef.current;
        }
      }
    }, [ ref ]);

    const firstOptionValue = useMemo(() => {
      const childArray = Children.toArray(children);

      const validOptions = Arr.filter(childArray, (child): child is ReactElement<SegmentedControlOptionProps> =>
        isValidElement(child) && typeof child.type !== 'string'
      );

      const firstNonDisabledOption = Arr.find(validOptions, (option) => !disabled && !option.props.disabled);
      return firstNonDisabledOption.map((option) => option.props.value).getOrNull();
    }, [ children, disabled ]);

    KeyboardNavigationHooks.useFlowKeyNavigation({
      containerRef,
      selector: '[role="radio"]',
      allowHorizontal: true,
      allowVertical: false,
      cycles: true,
      execute: (focused: SugarElement<HTMLElement>) => {
        const optionValue = Attribute.get(focused, 'data-value');
        const isOptionDisabled = Attribute.get(focused, 'aria-disabled') === 'true';

        if (Type.isNonNullable(optionValue) && optionValue !== value && !disabled && !isOptionDisabled) {
          onChange(optionValue);
        }
        return Optional.some(true);
      }
    });

    const contextValue: SegmentedControlContextValue = {
      value,
      onChange,
      disabled,
      firstOptionValue
    };

    return (
      <SegmentedControlContext.Provider value={contextValue}>
        <div
          ref={containerRef}
          className={Bem.block('tox-segmented-control', { disabled })}
          role="radiogroup"
          aria-disabled={disabled}
          {...rest}
        >
          {children}
        </div>
      </SegmentedControlContext.Provider>
    );
  }
);

const Option = forwardRef<HTMLSpanElement, SegmentedControlOptionProps>((
  {
    value: optionValue,
    disabled: optionDisabled,
    children
  },
  ref
) => {
  const {
    value: selectedValue,
    onChange,
    disabled: groupDisabled,
    firstOptionValue
  } = useSegmentedControlContext();

  const isActive = selectedValue === optionValue;
  const isDisabled = groupDisabled || optionDisabled;
  const isFirstOption = firstOptionValue === optionValue;

  const getTabIndex = (): number => {
    if (isDisabled) {
      return -1;
    }
    return isFirstOption ? 0 : -1;
  };

  const handleClick = () => {
    if (!isDisabled && !isActive) {
      onChange(optionValue);
    }
  };

  return (
    <span
      ref={ref}
      className={Bem.element('tox-segmented-control', 'segment', { active: isActive })}
      role="radio"
      aria-checked={isActive}
      aria-disabled={isDisabled ? 'true' : 'false'}
      tabIndex={getTabIndex()}
      data-value={optionValue}
      onClick={handleClick}
    >
      {children}
    </span>
  );
});

export {
  Root,
  Option
};
