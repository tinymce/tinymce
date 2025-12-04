import { Fun } from '@ephox/katamari';
import { forwardRef, useEffect, useId, useMemo, useState } from 'react';

import * as Bem from '../../../utils/Bem';
import * as Dropdown from '../../dropdown/Dropdown';
import { Icon } from '../../icon/Icon';
import type { CommonMenuItemInstanceApi, SubmenuProps } from '../internals/Types';

export const SubmenuItem = forwardRef<HTMLButtonElement, SubmenuProps>(({ autoFocus = false, enabled = true, text, icon, iconResolver, onSetup, children, submenusSide = 'right' }, ref) => {
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
    return Fun.noop;
  }, [ onSetup, api ]);

  return (
    <Dropdown.Root side={submenusSide} align={'start'} triggerEvents={[ 'click', 'hover' ]}>
      <Dropdown.Trigger>
        <button
          id={id}
          ref={ref}
          style={{ boxSizing: 'border-box', width: '100%' }}
          tabIndex={-1}
          role='menuitem'
          aria-label={text}
          aria-haspopup={'true'}
          aria-disabled={!state.enabled}
          onFocus={() => setState({ ...state, focused: true })}
          onPointerEnter={() => setState({ ...state, hovered: true })}
          onPointerLeave={() => setState({ ...state, hovered: false })}
          onBlur={() => setState({ ...state, focused: false })}
          className={Bem.element('tox-collection', 'item', {
            'active': state.focused || state.hovered,
            'state-disabled': !state.enabled,
          })}
          autoFocus={autoFocus}
        >
          <div className={Bem.element('tox-collection', 'item-icon')}>
            {icon && iconResolver && <Icon icon={icon} resolver={iconResolver} />}
          </div>
          <div className={Bem.element('tox-collection', 'item-label')}>{text}</div>
          <div className={Bem.element('tox-collection', 'item-caret')}>
            {iconResolver && <Icon resolver={iconResolver} icon={'chevron-right'}></Icon>}
          </div>
        </button>
      </Dropdown.Trigger>
      <Dropdown.Content>
        {children}
      </Dropdown.Content>
    </Dropdown.Root>
  );
});