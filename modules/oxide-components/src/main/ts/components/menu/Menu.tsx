import { Arr, Fun, Id } from '@ephox/katamari';
import { forwardRef, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { Icon } from '../../internal/icon/Icon.component';
import { Bem, Dropdown, KeyboardNavigationHooks } from '../../main';

import type { CommonMenuItemInstanceApi, MenuProps, SimpleMenuItemProps, SubmenuProps, ToggleMenuItemInstanceApi, ToggleMenuItemProps } from './internals/Types';

const SubmenuItem = forwardRef<HTMLDivElement, SubmenuProps>(({ id, enabled = true, text, icon, iconResolver, onSetup, items, submenusSide }, ref) => {
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
    <Dropdown.Root side={submenusSide} align={'start'} triggersOnHover={true}>
      <div ref={ref}>
        <Dropdown.TriggerButton
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

        </Dropdown.TriggerButton>
      </div>
      <Dropdown.Content>
        <Menu iconResolver={iconResolver} items={items}></Menu>
      </Dropdown.Content>
    </Dropdown.Root>
  );
});

const SimpleMenuItem = forwardRef<HTMLDivElement, SimpleMenuItemProps>(({ id, enabled = true, onSetup, text, icon, iconResolver, shortcut, onAction }, ref) => {
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
    <div
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
    >
      <div className={Bem.element('tox-collection', 'item-icon')}>
        {icon && iconResolver && <Icon icon={icon} resolver={iconResolver} />}
      </div>
      <div className={Bem.element('tox-collection', 'item-label')}>{text}</div>
      {shortcut && <div className={Bem.element('tox-collection', 'item-accessory')}>{shortcut}</div>}
    </div>
  );
});

const ToggleMenuItem = forwardRef<HTMLDivElement, ToggleMenuItemProps>(({ id, enabled = true, onSetup, text, icon, iconResolver, active = false, shortcut, onAction }, ref) => {
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
    <div
      id={id}
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
    >
      <div className={Bem.element('tox-collection', 'item-icon')}>
        {icon && iconResolver && <Icon icon={icon} resolver={iconResolver} />}
      </div>
      <div className={Bem.element('tox-collection', 'item-label')}>{text}</div>
      {shortcut && <div className={Bem.element('tox-collection', 'item-accessory')}>{shortcut}</div>}
      <div className={Bem.element('tox-collection', 'item-checkmark')} >
        {iconResolver && <Icon icon={'checkmark'} resolver={iconResolver} />}
      </div>
    </div>
  );
});

export const Menu: FC<MenuProps> = ({ items, iconResolver, submenusSide = 'right', autoFocus = true }) => {
  const ref = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);
  KeyboardNavigationHooks.useFlowKeyNavigation({
    containerRef: ref,
    selector: '.tox-collection__item:not([aria-disabled="true"])',
    allowHorizontal: false,
    cycles: false
  });
  useEffect(() => {
    if (autoFocus && firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [ autoFocus ]);
  const itemsWithId = useMemo(() => Arr.map(items, (itemProps) => ({ ...itemProps, id: Id.generate('menu-item') })), [ items ]);
  return (
    <div ref={ref} role='menu' className={[ Bem.block('tox-menu'), Bem.block('tox-collection', { list: true }) ].join(' ')}>
      <div className={Bem.element('tox-collection', 'group')}>
        {
          Arr.map(itemsWithId, (itemProps, index) => {
            if (itemProps.type === 'togglemenuitem') {
              return (<ToggleMenuItem
                iconResolver={iconResolver}
                ref={index === 0 ? firstItemRef : null}
                key={itemProps.id}
                {...itemProps}
              />);
            }
            if (itemProps.type === 'menuitem') {
              return (<SimpleMenuItem
                iconResolver={iconResolver}
                ref={index === 0 ? firstItemRef : null}
                key={itemProps.id}
                {...itemProps}
              />);
            }
            if (itemProps.type === 'submenu') {
              return (<SubmenuItem
                submenusSide={submenusSide}
                iconResolver={iconResolver}
                ref={index === 0 ? firstItemRef : null}
                key={itemProps.id}
                {...itemProps}
              />);
            }
          })
        }
      </div>
    </div>
  );
};

// TODO: investigate and improve keyboard navigation.
// Currently, items recieve active class on both hover and focus. When mixing mouse movement and navigating with keyboard it sometimes results in two 'active' elements
// Look at the tinymce menus for correct behavior