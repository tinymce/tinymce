import { Fun } from '@ephox/katamari';
import { forwardRef, useEffect, useId, useMemo, useState } from 'react';

import { Icon } from '../../../internal/icon/Icon.component';
import * as Bem from '../../../utils/Bem';
import type { ToggleMenuItemInstanceApi, ToggleMenuItemProps } from '../internals/Types';

export const ToggleMenuItem = forwardRef<HTMLButtonElement, ToggleMenuItemProps>(({ autoFocus = false, enabled = true, onSetup, text, icon, iconResolver, active = false, shortcut, onAction }, ref) => {
  const [ state, setState ] = useState({
    enabled,
    active,
    focused: false,
    hovered: false,
  });

  useEffect(() => {
    setState((prevState) => ({ ...prevState, enabled, active }));
  }, [ enabled, active ]);

  const api: ToggleMenuItemInstanceApi = useMemo(() => ({
    isEnabled: () => state.enabled,
    setEnabled: (newEnabled: boolean) => {
      setState((prev) => ({ ...prev, enabled: newEnabled }));
    },
    isActive: () => state.active,
    setActive: (newActive: boolean) => {
      setState((prev) => ({ ...prev, active: newActive }));
    }
  }), [ state ]);

  useEffect(() => {
    if (onSetup) {
      const teardown = onSetup(api);
      return () => teardown(api);
    }
    return Fun.noop;
  }, [ onSetup, api ]);

  return (
    <button
      id={useId()}
      tabIndex={-1}
      role='menuitemcheckbox'
      aria-label={text}
      aria-haspopup={false}
      aria-disabled={!state.enabled}
      aria-selected={state.active}
      onFocus={() => setState({ ...state, focused: true })}
      onPointerEnter={() => setState({ ...state, hovered: true })}
      onPointerLeave={() => setState({ ...state, hovered: false })}
      onBlur={() => setState({ ...state, focused: false })}
      onClick={() => onAction(api)}
      className={Bem.element('tox-collection', 'item', {
        'enabled': state.active,
        'active': state.focused || state.hovered,
        'state-disabled': !state.enabled,
      })}
      ref={ref}
      autoFocus={autoFocus}
      aria-keyshortcuts={shortcut}
    >
      <div className={Bem.element('tox-collection', 'item-icon')}>
        {icon && iconResolver && <Icon icon={icon} resolver={iconResolver} />}
      </div>
      <div className={Bem.element('tox-collection', 'item-label')}>{text}</div>
      {shortcut && <div className={Bem.element('tox-collection', 'item-accessory')}>{shortcut}</div>}
      <div className={Bem.element('tox-collection', 'item-checkmark')} >
        {iconResolver && <Icon icon={'checkmark'} resolver={iconResolver} />}
      </div>
    </button>
  );
});