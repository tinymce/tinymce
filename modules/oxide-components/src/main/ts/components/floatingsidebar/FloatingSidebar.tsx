import { useEffect, useRef, type FC, type PropsWithChildren, type ReactElement, type ReactNode } from 'react';

import { Draggable } from '../../main';
import { classes } from '../../utils/Styles';

export interface FloatingSidebarProps extends PropsWithChildren {
  isOpen?: boolean;
  height?: number;
}
interface HeaderProps extends PropsWithChildren {};

interface Slots {
  header: ReactNode;
  children: ReactNode;
}

const createSlots = (children: ReactNode): Slots => {
  const header = (Array.isArray(children) ? children : [ children ]).find((child: ReactNode) => (child as ReactElement)?.type === Header);
  const otherChildren = (Array.isArray(children) ? children : [ children ]).filter((child: ReactNode) => (child as ReactElement)?.type !== Header);

  if (header === undefined) {
    throw new Error('FloatingSidebar requires a header');
  }

  return { header, children: otherChildren };
};

const Root: FC<FloatingSidebarProps> = ({ isOpen = true, height = 600, ...props }) => {
  const { header, children } = createSlots(props.children);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      isOpen ? element.showPopover() : element.hidePopover();
    }
  }, [ isOpen ]);

  return (
    <Draggable.Root
      ref={elementRef}
      popover="manual"
      className={classes([ 'tox-floating-sidebar' ])}
      style={{ '--tox-private-floating-sidebar-requested-height': `${height}px` }}
    >
      <aside className={classes([ 'tox-floating-sidebar__content-wrapper' ])}>
        <Draggable.Handle>{ header }</Draggable.Handle>
        { children }
      </aside>
    </Draggable.Root>
  );
};

const Header: FC<HeaderProps> = ({ children }) => {
  return (
    <header className={classes([ 'tox-sidebar-content__header', 'tox-floating-sidebar__header' ])}>{ children }</header>
  );
};

export { Root, Header };
