import { useRef, type FC, type PropsWithChildren } from 'react';

import * as KeyboardNavigationHooks from '../../keynav/KeyboardNavigationHooks';
import * as Bem from '../../utils/Bem';

export const Menu: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  KeyboardNavigationHooks.useFlowKeyNavigation({
    containerRef: ref,
    selector: '.tox-collection__item:not([aria-disabled="true"])',
    allowHorizontal: false,
    cycles: false
  });

  return (
    <div ref={ref} role='menu' className={[ Bem.block('tox-menu'), Bem.block('tox-collection', { list: true }) ].join(' ')}>
      <div className={Bem.element('tox-collection', 'group')}>
        {children}
      </div>
    </div>
  );
};

// TODO: improve managing active state #TINY-13425
// Currently, items receive active class on both hover and focus. When mixing mouse movement and navigating with keyboard it sometimes results in two 'active' elements
// Look at the tinymce menus for correct behavior