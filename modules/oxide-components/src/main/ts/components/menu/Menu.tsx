import { Arr, Id } from '@ephox/katamari';
import { useEffect, useMemo, useRef, type FC } from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';
import * as Bem from '../../utils/Bem';

import { SimpleMenuItem } from './components/SimpleMenuItem';
import { SubmenuItem } from './components/SubmenuItem';
import { ToggleMenuItem } from './components/ToggleMenuItem';
import type { MenuProps } from './internals/Types';

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
// TODO: investigate the autoFocus behavior. If the menu is put inside the dropdown (popover), everything is in the DOM before the user opens. Because of that the autoFocus on render doesn't work - or it does work but not on open, in the right moment.