import type { Property } from 'csstype';
import type { CSSProperties, FC, PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';
import { classes } from '../../utils/Styles';
import * as Draggable from '../draggable/Draggable';
import '../../module/css';
export interface FloatingSidebarProps extends PropsWithChildren {
  isOpen?: boolean;
  origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  initialPosition?: { x: Property.Top; y: Property.Left };
  style?: CSSProperties;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}
interface HeaderProps extends PropsWithChildren {};

const Root: FC<FloatingSidebarProps> = ({ isOpen = true, children, style, origin = 'top-right', initialPosition = { x: 0, y: 0 }, onDragStart, onDragEnd }) => {
  return (
    <Draggable.Root
      className={Bem.block('tox-floating-sidebar', { open: isOpen })}
      origin={origin}
      initialPosition={initialPosition}
      allowedOverflow={{ horizontal: 0 }}
      declaredSize={{ width: 'var(--tox-private-floating-sidebar-width)', height: 'var(--tox-private-floating-sidebar-height)' }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
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
