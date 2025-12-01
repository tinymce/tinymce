import { Fun } from '@ephox/katamari';
import { forwardRef, useEffect, useMemo, useState } from 'react';

import { Icon } from '../../../internal/icon/Icon.component';
import * as Bem from '../../../utils/Bem';
import * as Dropdown from '../../dropdown/Dropdown';
import type { CommonMenuItemInstanceApi, SubmenuProps } from '../internals/Types';
import { Menu } from '../Menu';

export const SubmenuItem = forwardRef<HTMLDivElement, SubmenuProps>(({ id, enabled = true, text, icon, iconResolver, onSetup, items, submenusSide }, ref) => {
  const [ state, setState ] = useState({
    enabled,
    focused: false,
    hovered: false,
  });

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
    <Dropdown.Root side={submenusSide} align={'start'} triggerEvent={'both'}>
      <div ref={ref}>
        <Dropdown.Trigger>
          <div
            style={{ boxSizing: 'border-box', width: '100%' }}
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
            className={Bem.element('tox-collection', 'item', {
              'active': state.focused || state.hovered,
              'state-disabled': !state.enabled,
            })}
          >
            <div className={Bem.element('tox-collection', 'item-icon')}>
              {icon && iconResolver && <Icon icon={icon} resolver={iconResolver} />}
            </div>
            <div className={Bem.element('tox-collection', 'item-label')}>{text}</div>
            <div className={Bem.element('tox-collection', 'item-caret')}>
              {iconResolver && <Icon resolver={iconResolver} icon={'chevron-right'}></Icon>}
            </div>
          </div>
        </Dropdown.Trigger>
      </div>
      <Dropdown.Content>
        <Menu iconResolver={iconResolver} items={items}></Menu>
      </Dropdown.Content>
    </Dropdown.Root>
  );
});