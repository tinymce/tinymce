import { isValidElement, useEffect, useMemo, useRef, type FC, type PropsWithChildren, type ReactNode } from 'react';

import { classes } from '../../utils/Styles';
import * as Draggable from '../draggable/Draggable';
import '../../module/css';

export interface FloatingSidebarProps extends PropsWithChildren {
  isOpen?: boolean;
  height?: number;
  initialPosition?: {
    x: number;
    y: number;
    origin: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  };
}
interface HeaderProps extends PropsWithChildren {};

interface Slots {
  header: ReactNode;
  children: ReactNode;
}

// TODO(TINY-13136): Use generic `createSlots` instead
const createSlots = (children: ReactNode): Slots => {
  const header = (Array.isArray(children) ? children : [ children ]).filter((child: ReactNode) => isValidElement(child) && child.type === Header);
  const otherChildren = (Array.isArray(children) ? children : [ children ]).filter((child: ReactNode) => !isValidElement(child) || child.type !== Header);

  if (header.length === 0) {
    throw new Error('FloatingSidebar requires a header');
  }
  if (header.length > 1) {
    throw new Error('FloatingSidebar accepts only one header');
  }

  return { header: header[0], children: otherChildren };
};

const Root: FC<FloatingSidebarProps> = ({ isOpen = true, height = 600, initialPosition = { x: 0, y: 0, origin: 'topleft' }, ...props }) => {
  const { header, children } = createSlots(props.children);
  const elementRef = useRef<HTMLDivElement | null>(null);

  // TODO: move to separate funtion
  const absolutePosition = useMemo(() => {
    switch (initialPosition.origin) {
      case 'topleft':
        return { top: `${initialPosition.y}px`, left: `${initialPosition.x}px` } as const;
      case 'topright':
        return { top: `${initialPosition.y}px`, left: `calc(${initialPosition.x}px - var(--tox-private-floating-sidebar-width))` } as const;
      case 'bottomleft':
        return { top: `calc(${initialPosition.y}px - var(--tox-private-floating-sidebar-height))`, left: `${initialPosition.x}px` } as const;
      case 'bottomright':
        return { top: `calc(${initialPosition.y}px - var(--tox-private-floating-sidebar-height))`, left: `calc(${initialPosition.x}px - var(--tox-private-floating-sidebar-width))` } as const;
    }
  }, [ initialPosition ]);

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
      initialPosition={absolutePosition}
      declaredSize={{ width: 'var(--tox-private-floating-sidebar-width)', height: 'var(--tox-private-floating-sidebar-height)' }}
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
