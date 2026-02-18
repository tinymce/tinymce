import { Arr, Optional, Type } from '@ephox/katamari';
import { Focus, Selectors, SugarElement } from '@ephox/sugar';
import {
  createContext,
  forwardRef,
  type FunctionComponent,
  type HTMLAttributes,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef
} from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';
import * as Bem from '../../utils/Bem';

interface SegmentedControlContextValue {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
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

    KeyboardNavigationHooks.useFlowKeyNavigation({
      containerRef,
      selector: '[role="radio"]',
      allowHorizontal: true,
      allowVertical: false,
      cycles: true,
      execute: (focused: SugarElement<HTMLElement>) => {
        const optionValue = focused.dom.getAttribute('data-value');
        if (Type.isNonNullable(optionValue) && optionValue !== value && !disabled) {
          onChange(optionValue);
        }
        return Optional.some(true);
      }
    });

    useEffect(() => {
      if (Type.isNonNullable(containerRef.current)) {
        const container = SugarElement.fromDom(containerRef.current);
        const radioElements = Selectors.all<HTMLElement>('[role="radio"]', container);
        Arr.find(radioElements, (element: SugarElement<HTMLElement>) => {
          const dataValue = element.dom.getAttribute('data-value');
          return dataValue === value;
        }).each(Focus.focus);
      }
    }, [ value ]);

    const contextValue: SegmentedControlContextValue = {
      value,
      onChange,
      disabled
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

const Option: FunctionComponent<SegmentedControlOptionProps> = ({
  value: optionValue,
  disabled: optionDisabled,
  children
}) => {
  const {
    value: selectedValue,
    onChange,
    disabled: groupDisabled
  } = useSegmentedControlContext();

  const isActive = selectedValue === optionValue;
  const isDisabled = groupDisabled || optionDisabled;

  const getTabIndex = (): number => {
    if (isDisabled) {
      return -1;
    }
    return isActive ? 0 : -1;
  };

  const handleClick = () => {
    if (!isDisabled && !isActive) {
      onChange(optionValue);
    }
  };

  return (
    <span
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
};

export {
  Root,
  Option
};
