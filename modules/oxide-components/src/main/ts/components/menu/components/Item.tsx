import { Type } from '@ephox/katamari';
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';

import * as Bem from '../../../utils/Bem';
import { Icon } from '../../icon/Icon';
import type { CommonMenuItemInstanceApi, MenuItemProps } from '../internals/Types';

export const Item = forwardRef<HTMLButtonElement, MenuItemProps>(({ autoFocus = false, enabled = true, onSetup, icon, shortcut, onAction, children }, ref) => {
  const [ state, setState ] = useState({
    enabled,
    focused: false,
    hovered: false,
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
  }, [ onSetup, api ]);

  const itemIcon = Type.isString(icon)
    ? <Icon icon={icon} />
    : icon;

  return (
    <button
      id={id}
      tabIndex={-1}
      role='menuitem'
      aria-haspopup={false}
      aria-disabled={!state.enabled}
      disabled={!state.enabled}
      onFocus={() => setState({ ...state, focused: true })}
      onPointerEnter={() => setState({ ...state, hovered: true })}
      onPointerLeave={() => setState({ ...state, hovered: false })}
      onBlur={() => setState({ ...state, focused: false })}
      onClick={() => onAction(api)}
      className={Bem.element('tox-collection', 'item', {
        'active': state.focused || state.hovered,
        'state-disabled': !state.enabled,
      })}
      ref={ref}
      autoFocus={autoFocus}
      aria-keyshortcuts={shortcut}
    >
      {itemIcon && <div className={Bem.element('tox-collection', 'item-icon')}>{itemIcon}</div>}
      <div className={Bem.element('tox-collection', 'item-label')}>{children}</div>
      {shortcut && <div className={Bem.element('tox-collection', 'item-accessory')}>{shortcut}</div>}
    </button>
  );
});
