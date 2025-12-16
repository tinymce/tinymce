import { useRef, useCallback, type CSSProperties, type FC, type PropsWithChildren } from 'react';

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
  const elementRef = useRef<HTMLDivElement | null>(null);
  const minimumVisiblityInPx = 70;
  const provideBoundaries = useCallback(() => {
    const draggableRect = elementRef.current?.getBoundingClientRect();
    if (!draggableRect) {
      return {
        upperLeftCorner: { x: 0, y: 0 },
        bottomRightCorner: { x: document.documentElement.clientWidth, y: document.documentElement.clientHeight }
      };
    }
    return {
      upperLeftCorner: { x: minimumVisiblityInPx - draggableRect.width, y: 0 },
      bottomRightCorner: { x: document.documentElement.clientWidth + draggableRect.width - minimumVisiblityInPx, y: document.documentElement.clientHeight }
    };
  }, []);
  const initialPosition = transformToCss(props.initialPosition ?? { x: 0, y: 0, origin: 'topleft' });

  return (
    <Draggable.Root
      ref={elementRef}
      className={Bem.block('tox-floating-sidebar', { open: isOpen })}
      initialPosition={initialPosition}
      provideBoundaries={provideBoundaries}
      // TODO: rename this property, it should not be called `declaredSize` but rather ...
      declaredSize={{ width: '70px', height: 'var(--tox-private-floating-sidebar-height)' }}
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
