import { Fun, Optional, Optionals, Type } from '@ephox/katamari';
import { Compare, SelectorFind, SugarElement } from '@ephox/sugar';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import * as Bem from '../../../utils/Bem';
import * as Dropdown from '../../dropdown/Dropdown';
import { Icon } from '../../icon/Icon';
import type { CommonMenuItemInstanceApi, SubmenuProps } from '../internals/Types';

const isSiblingMenuItemInSameGroup = (relatedTarget: Element | null, currentTarget: Element): boolean => {
  const groupSelector = Bem.elementSelector('tox-collection', 'group');
  const getGroup = (el: Element) => SelectorFind.closest(SugarElement.fromDom(el), groupSelector);

  return Optional.from(relatedTarget).exists((target) =>
    Optionals.equals(getGroup(currentTarget), getGroup(target), Compare.eq)
  );
};

const isMenuItemOutsideContainer = (relatedTarget: Element | null, container: Element): boolean => {
  return Optional.from(relatedTarget).exists((target) => {
    const targetElement = SugarElement.fromDom(target);
    return !Compare.contains(SugarElement.fromDom(container), targetElement);
  });
};

export const SubmenuItem = forwardRef<HTMLButtonElement, SubmenuProps>(({ enabled = true, icon, onSetup, children, submenusSide = 'right', submenuContent }, ref) => {
  const [ state, setState ] = useState({
    enabled,
    focused: false,
    isSubmenuOpen: false,
    focusMovedToOtherMenuItem: false,
  });
  const id = useId();
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [ state ]);

  useEffect(() => {
    setState((prevState) => ({ ...prevState, enabled }));
  }, [ enabled ]);

  const api: CommonMenuItemInstanceApi = useMemo(() => ({
    isEnabled: () => stateRef.current.enabled,
    setEnabled: (newEnabled: boolean) => {
      setState((prev) => ({ ...prev, enabled: newEnabled }));
    }
  }), []);

  useEffect(() => {
    if (onSetup) {
      const teardown = onSetup(api);
      return () => teardown(api);
    }
    return Fun.noop;
  }, [ onSetup, api ]);

  const itemIcon = Type.isString(icon)
    ? <Icon icon={icon} />
    : icon;

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setState((prev) => ({
      ...prev,
      isSubmenuOpen: isOpen
    }));
  }, []);

  return (
    <Dropdown.Root
      side={submenusSide}
      align={'start'}
      triggerEvents={[ 'click', 'hover' ]}
    >
      <Dropdown.Trigger>
        <button
          id={id}
          ref={ref}
          style={{ boxSizing: 'border-box', width: '100%' }}
          tabIndex={-1}
          role='menuitem'
          aria-haspopup={'true'}
          aria-disabled={!state.enabled}
          disabled={!state.enabled}
          onFocus={() => setState((prev) => ({ ...prev, focused: true, focusMovedToOtherMenuItem: false }))}
          onPointerMove={(e) => {
            if (state.enabled) {
              e.currentTarget.focus();
            }
          }}
          onBlur={(e) => {
            const relatedTarget = e.relatedTarget;
            setState((prev) => ({
              ...prev,
              focused: false,
              focusMovedToOtherMenuItem: isSiblingMenuItemInSameGroup(relatedTarget, e.target)
            }));
          }}
          className={Bem.element('tox-collection', 'item', {
            'active': state.focused || (state.isSubmenuOpen && !state.focusMovedToOtherMenuItem),
            'state-disabled': !state.enabled,
          })}
        >
          {itemIcon && <div className={Bem.element('tox-collection', 'item-icon')}>{itemIcon}</div>}
          <div className={Bem.element('tox-collection', 'item-label')}>{children}</div>
          <div className={Bem.element('tox-collection', 'item-caret')}>
            <Icon icon={'chevron-right'} />
          </div>
        </button>
      </Dropdown.Trigger>
      <Dropdown.Content onOpenChange={handleOpenChange}>
        <div
          onBlur={(e) => {
            const relatedTarget = e.relatedTarget;
            if (isMenuItemOutsideContainer(relatedTarget, e.target)) {
              setState((prev) => ({ ...prev, focusMovedToOtherMenuItem: true }));
            }
          }}
        >
          {submenuContent}
        </div>
      </Dropdown.Content>
    </Dropdown.Root>
  );
});
