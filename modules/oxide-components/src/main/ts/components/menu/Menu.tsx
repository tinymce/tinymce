import { Optional, Type } from '@ephox/katamari';
import { Focus, SelectorFind, SugarElement } from '@ephox/sugar';
import { forwardRef, useEffect, useRef, type MutableRefObject, type PropsWithChildren } from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';
import * as Bem from '../../utils/Bem';

import { Item } from './components/Item';
import { SubmenuItem } from './components/SubmenuItem';
import { ToggleItem } from './components/ToggleItem';

const ENABLED_ITEM_SELECTOR = `${Bem.elementSelector('tox-collection', 'item')}:not([aria-disabled="true"])`;

const focusFirstEnabledMenuItem = (container: Element | null): void =>
  Optional.from(container).each((element) =>
    SelectorFind.descendant<HTMLElement>(SugarElement.fromDom(element), ENABLED_ITEM_SELECTOR).each(Focus.focus)
  );

const Root = forwardRef<HTMLDivElement, PropsWithChildren<unknown>>(({ children }, ref) => {

  const internalRef: MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

  KeyboardNavigationHooks.useFlowKeyNavigation({
    containerRef: internalRef,
    selector: ENABLED_ITEM_SELECTOR,
    allowHorizontal: false,
    cycles: false
  });

  useEffect(() => {
    focusFirstEnabledMenuItem(internalRef.current);
  }, []);

  const refCb = (element: HTMLDivElement | null) => {
    internalRef.current = element;
    if (Type.isNonNullable(ref)) {
      if (Type.isFunction(ref)) {
        ref(element);
      } else {
        ref.current = element;
      }
    }
  };

  return (
    <div ref={refCb} role='menu' className={[ Bem.block('tox-menu'), Bem.block('tox-collection', { list: true }) ].join(' ')}>
      <div className={Bem.element('tox-collection', 'group')}>
        {children}
      </div>
    </div>
  );
});

export {
  Item,
  Root,
  SubmenuItem,
  ToggleItem
};
