import { Fun, Type } from '@ephox/katamari';
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';

import * as Bem from '../../../utils/Bem';
import * as Dropdown from '../../dropdown/Dropdown';
import { Icon } from '../../icon/Icon';
import { useMenu } from '../internals/Context';
import type { CommonMenuItemInstanceApi, SubmenuProps } from '../internals/Types';

export const SubmenuItem = forwardRef<HTMLDivElement, SubmenuProps>(({ enabled = true, icon, onSetup, children, submenusSide = 'right', submenuContent }, ref) => {
  const [ state, setState ] = useState({
    enabled,
    focused: false,
    isActive: false,
  });
  const id = useId();
  const stateRef = useRef(state);
  const { activeItemId, setActiveItemId } = useMenu();

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

  const submenuContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.enabled) {
      submenuContentRef.current?.hidePopover();
    }
  }, [ state.enabled ]);

  useEffect(() => {
    const isActive = activeItemId === id;
    setState((prev) => ({ ...prev, isActive }));
    if (!isActive && submenuContentRef.current?.matches(':popover-open')) {
      submenuContentRef.current.hidePopover();
    }
  }, [ activeItemId, id ]);

  const itemIcon = Type.isString(icon)
    ? <Icon icon={icon} />
    : icon;

  return (
    <Dropdown.Root
      side={submenusSide}
      align={'start'}
      triggerEvents={state.enabled ? [ 'click', 'hover', 'arrows' ] : []}
    >
      <Dropdown.Trigger>
        <div
          id={id}
          ref={ref}
          style={{ boxSizing: 'border-box', width: '100%' }}
          tabIndex={-1}
          role='menuitem'
          aria-haspopup={'true'}
          aria-disabled={!state.enabled}
          onFocus={() => {
            setState((prev) => ({ ...prev, focused: true }));
            setActiveItemId(id);
          }}
          onPointerMove={(e) => {
            if (state.enabled) {
              e.currentTarget.focus();
            }
          }}
          onBlur={() => setState((prev) => ({ ...prev, focused: false }))}
          className={Bem.element('tox-collection', 'item', {
            'active': state.focused || state.isActive,
            'state-disabled': !state.enabled,
          })}
        >
          {itemIcon && <div className={Bem.element('tox-collection', 'item-icon')}>{itemIcon}</div>}
          <div className={Bem.element('tox-collection', 'item-label')}>{children}</div>
          <div className={Bem.element('tox-collection', 'item-caret')}>
            <Icon icon={'chevron-right'} />
          </div>
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content ref={submenuContentRef}>
        {submenuContent}
      </Dropdown.Content>
    </Dropdown.Root>
  );
});
