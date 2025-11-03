import { useEffect, useRef, type FC, type PropsWithChildren } from 'react';

import { classes } from '../../utils/Styles';
import * as Draggable from '../draggable/Draggable';
import '../../module/css';
import type { CssPosition } from '../draggable/internals/types';

interface InitialPosition {
  x: number;
  y: number;
  origin: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
}
export interface FloatingSidebarProps extends PropsWithChildren {
  isOpen?: boolean;
  height?: number;
  initialPosition?: InitialPosition;
}
interface HeaderProps extends PropsWithChildren {};

const transformToCss = (position: InitialPosition): CssPosition => {
  switch (position.origin) {
    case 'topleft':
      return { top: `${position.y}px`, left: `${position.x}px` } as const;
    case 'topright':
      return { top: `${position.y}px`, left: `calc(${position.x}px - var(--tox-private-floating-sidebar-width))` } as const;
    case 'bottomleft':
      return { top: `calc(${position.y}px - var(--tox-private-floating-sidebar-height))`, left: `${position.x}px` } as const;
    case 'bottomright':
      return { top: `calc(${position.y}px - var(--tox-private-floating-sidebar-height))`, left: `calc(${position.x}px - var(--tox-private-floating-sidebar-width))` } as const;
  }
};

const Root: FC<FloatingSidebarProps> = ({ isOpen = true, height = 600, children, ...props }) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const initialPosition = transformToCss(props.initialPosition ?? { x: 0, y: 0, origin: 'topleft' });

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
      initialPosition={initialPosition}
      declaredSize={{ width: 'var(--tox-private-floating-sidebar-width)', height: 'var(--tox-private-floating-sidebar-height)' }}
    >
      <aside className={classes([ 'tox-floating-sidebar__content-wrapper' ])}>
        { children }
      </aside>
    </Draggable.Root>
  );
};

const Header: FC<HeaderProps> = ({ children }) => {
  return (
    <Draggable.Handle>
      <header className={classes([ 'tox-sidebar-content__header', 'tox-floating-sidebar__header' ])}>{ children }</header>
    </Draggable.Handle>
  );
};

export { Root, Header };
