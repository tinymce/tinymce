import { Type } from '@ephox/katamari';
import type { Property } from 'csstype';
import { forwardRef, useCallback, type CSSProperties, type PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';
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

const Root = forwardRef<HTMLDivElement, FloatingSidebarProps>(({ isOpen = true, children, style, origin = 'top-right', initialPosition = { x: 0, y: 0 }, onDragStart, onDragEnd }, ref) => {
  return (
    <Draggable.Root
      className={Bem.block('tox-floating-sidebar', { open: isOpen })}
      origin={origin}
      initialPosition={initialPosition}
      allowedOverflow={{ horizontal: 0.8 }}
      declaredSize={{ width: 'var(--tox-private-floating-sidebar-width)', height: 'var(--tox-private-floating-sidebar-height)' }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={style}
      ref={ref}
    >
      <aside className={Bem.element('tox-floating-sidebar', 'content-wrapper')}>
        {children}
      </aside>
    </Draggable.Root>
  );
});

const Header = forwardRef<HTMLDivElement, HeaderProps>(({ children }, ref) => {
  const refCallback = useCallback((node: HTMLDivElement | null) => {
    if (ref) {
      if (Type.isFunction(ref)) {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  }, [ ref ]);

  return (
    <Draggable.Handle>
      <header ref={refCallback} className={`${Bem.element('tox-sidebar-content', 'header')} ${Bem.element('tox-floating-sidebar', 'header')}`}>{ children }</header>
    </Draggable.Handle>
  );
});

export { Header, Root };
