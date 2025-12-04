import { forwardRef, useEffect, useId, useMemo, useState } from 'react';

import * as Bem from '../../../utils/Bem';
import { Icon } from '../../icon/Icon';
import type { CommonMenuItemInstanceApi, MenuItemProps } from '../internals/Types';

export const Item = forwardRef<HTMLButtonElement, MenuItemProps>(({ autoFocus = false, enabled = true, onSetup, text, icon, iconResolver, shortcut, onAction }, ref) => {
  const [ state, setState ] = useState({
    enabled,
    focused: false,
    hovered: false,
  });
  const id = useId();

  useEffect(() => {
    setState((prevState) => ({ ...prevState, enabled }));
  }, [ enabled ]);

  const api: CommonMenuItemInstanceApi = useMemo(() => ({
    isEnabled: () => state.enabled,
    setEnabled: (newEnabled: boolean) => {
      setState((prev) => ({ ...prev, enabled: newEnabled }));
    }
  }), [ state ]);

  useEffect(() => {
    if (onSetup) {
      const teardown = onSetup(api);
      return () => teardown(api);
    }
  }, [ onSetup, api ]);

  return (
    <button
      id={id}
      tabIndex={-1}
      role='menuitem'
      aria-label={text}
      aria-haspopup={false}
      aria-disabled={!state.enabled}
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
      <div className={Bem.element('tox-collection', 'item-icon')}>
        {icon && iconResolver && <Icon icon={icon} resolver={iconResolver} />}
      </div>
      <div className={Bem.element('tox-collection', 'item-label')}>{text}</div>
      {shortcut && <div className={Bem.element('tox-collection', 'item-accessory')}>{shortcut}</div>}
    </button>
  );
});