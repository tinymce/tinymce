import { Fun, Type } from '@ephox/katamari';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState, type FocusEvent } from 'react';

import * as Bem from '../../../utils/Bem';
import * as Dropdown from '../../dropdown/Dropdown';
import { Icon } from '../../icon/Icon';
import type { CommonMenuItemInstanceApi, SubmenuProps } from '../internals/Types';

export const SubmenuItem = forwardRef<HTMLDivElement, SubmenuProps>(({ enabled = true, icon, onSetup, children, submenusSide = 'right', submenuContent }, ref) => {
  const [ state, setState ] = useState({
    enabled,
    focused: false,
  });
  const [ submenuOpen, setSubmenuOpen ] = useState(false);
  const id = useId();
  const stateRef = useRef(state);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const submenuContentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!state.enabled) {
      submenuContentRef.current?.hidePopover();
    }
  }, [ state.enabled ]);

  // Close the submenu when focus moves outside both the trigger and the submenu content.
  // Attached to both because they are siblings — neither's onBlur bubbles to the other.
  const handleZoneBlur = useCallback((e: FocusEvent<HTMLElement>) => {
    const relatedTarget = e.relatedTarget;
    const insideTrigger = Type.isNonNullable(relatedTarget) && (triggerRef.current?.contains(relatedTarget) ?? false);
    const insideContent = Type.isNonNullable(relatedTarget) && (submenuContentRef.current?.contains(relatedTarget) ?? false);
    if (!insideTrigger && !insideContent) {
      submenuContentRef.current?.hidePopover();
    }
  }, []);

  const setTriggerRef = useCallback((el: HTMLDivElement | null) => {
    triggerRef.current = el;
    if (Type.isFunction(ref)) {
      ref(el);
    } else if (Type.isNonNullable(ref)) {
      ref.current = el;
    }
  }, [ ref ]);

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
          ref={setTriggerRef}
          style={{ boxSizing: 'border-box', width: '100%' }}
          tabIndex={-1}
          role='menuitem'
          aria-haspopup={'true'}
          aria-disabled={!state.enabled}
          onFocus={() => setState((prev) => ({ ...prev, focused: true }))}
          onPointerMove={(e) => {
            if (state.enabled) {
              e.currentTarget.focus();
            }
          }}
          onBlur={(e) => {
            setState((prev) => ({ ...prev, focused: false }));
            handleZoneBlur(e);
          }}
          className={Bem.element('tox-collection', 'item', {
            'active': state.focused || submenuOpen,
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
      <Dropdown.Content
        ref={submenuContentRef}
        onOpenChange={setSubmenuOpen}
        onBlur={handleZoneBlur}
      >
        {submenuContent}
      </Dropdown.Content>
    </Dropdown.Root>
  );
});
