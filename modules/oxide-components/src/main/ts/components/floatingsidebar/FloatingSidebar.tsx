import type { Property } from 'csstype';
import type { CSSProperties, FC, PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';
import { classes } from '../../utils/Styles';
import * as Draggable from '../draggable/Draggable';
import '../../module/css';
export interface FloatingSidebarProps extends PropsWithChildren {
  isOpen?: boolean;
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  initialPosition?: { x: Property.Top; y: Property.Left };
  style?: CSSProperties;
}
interface HeaderProps extends PropsWithChildren {};

const Root: FC<FloatingSidebarProps> = ({ isOpen = true, children, style, anchor = 'top-left', initialPosition = { x: 0, y: 0 }}) => {
  return (
    <Draggable.Root
      className={Bem.block('tox-floating-sidebar', { open: isOpen })}
      anchor={anchor}
      initialPosition={initialPosition}
      allowedOverflow={{ horizontal: 0.8 }}
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
