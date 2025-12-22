import type { CSSProperties, FC, PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';
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
  initialPosition?: InitialPosition;
  style?: CSSProperties;
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

const Root: FC<FloatingSidebarProps> = ({ isOpen = true, children, style, ...props }) => {
  const initialPosition = transformToCss(props.initialPosition ?? { x: 0, y: 0, origin: 'topleft' });

  return (
    <Draggable.Root
      className={Bem.block('tox-floating-sidebar', { open: isOpen })}
      initialPosition={initialPosition}
      allowedOverflow={{ horizontal: 0 }}
      declaredSize={{ width: 'var(--tox-private-floating-sidebar-width)', height: 'var(--tox-private-floating-sidebar-height)' }}
      style={style}
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
