import { Optional } from '@ephox/katamari';
import { Focus, SelectorFind, SugarElement } from '@ephox/sugar';
import { useEffect, useRef, type FC, type PropsWithChildren } from 'react';

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

const Root: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  KeyboardNavigationHooks.useFlowKeyNavigation({
    containerRef: ref,
    selector: ENABLED_ITEM_SELECTOR,
    allowHorizontal: false,
    cycles: false
  });

  useEffect(() => {
    focusFirstEnabledMenuItem(ref.current);
  }, []);

  return (
    <div ref={ref} role='menu' className={[ Bem.block('tox-menu'), Bem.block('tox-collection', { list: true }) ].join(' ')}>
      <div className={Bem.element('tox-collection', 'group')}>
        {children}
      </div>
    </div>
  );
};

export {
  Root,
  Item,
  SubmenuItem,
  ToggleItem
};
