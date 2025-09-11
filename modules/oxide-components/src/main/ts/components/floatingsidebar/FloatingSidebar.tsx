/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback, useRef, useState, type PropsWithChildren } from 'react';

// TODO: add debounce
interface FloatingSidebarProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  children,
  isOpen,
  onClose,
  title,
}) => {
  const [ position, setPosition ] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [ isDragging, setIsDragging ] = useState(false);

  const startMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startSidebarPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sidebarHeaderRef = useRef<HTMLDivElement | null>(null);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    setIsDragging(true);
    sidebarHeaderRef.current!.setPointerCapture(event.pointerId);

    startMousePos.current = { x: event.clientX, y: event.clientY };

    const { x, y } = sidebarRef.current!.getBoundingClientRect();
    startSidebarPos.current = { x, y };
  }, []);

  const onDragging = useCallback((event: React.PointerEvent) => {
    event.stopPropagation();

    setPosition({
      x: startSidebarPos.current.x + (event.clientX - startMousePos.current.x),
      y: startSidebarPos.current.y + (event.clientY - startMousePos.current.y),
    });
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    setIsDragging(false);
    sidebarHeaderRef.current!.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <>
      {isOpen && (
        <section
          className={'tox-floating-sidebar'}
          style={{
            top: position.y,
            left: position.x,
          }}
          ref={sidebarRef}
        >
          <section
            className={'tox-floating-sidebar__header tox-sidebar-content__header'}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={isDragging ? onDragging : undefined}
            ref={sidebarHeaderRef}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            <span className='tox-sidebar-content__title'>{title}</span>
            <button
              // this should be an Icon button from oxide-components
              className='tox-button tox-button--secondary tox-button--icon'
              onClick={onClose}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            >
              ❌
            </button>
          </section>
          <section className={'tox-floating-sidebar__content tox-sidebar-content'}>{children}</section>
        </section>
      )}
    </>
  );
};
