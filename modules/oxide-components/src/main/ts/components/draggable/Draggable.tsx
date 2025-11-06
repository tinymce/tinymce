import { Optional } from '@ephox/katamari';
import { type FC, useState, useMemo, useRef, useCallback, forwardRef } from 'react';

import { boundaries, clamp, delta } from './internals/calculations';
import { useDraggable, DraggableContext } from './internals/context';
import { getPositioningStyles } from './internals/styles';
import type { DraggableProps, DraggableHandleProps, Shift, Position, Boundaries, CssPosition } from './internals/types';

const Root = forwardRef<HTMLDivElement, DraggableProps>(({ children, style, initialPosition = { top: 0, left: 0 }, declaredSize, ...props }, ref) => {
  const [ shift, setShift ] = useState<Shift>({ x: 0, y: 0 });
  const [ position, setPosition ] = useState<CssPosition | Position>(initialPosition);
  const [ isDragging, setIsDragging ] = useState(false);
  const draggableRef = useRef<HTMLDivElement | null>(null);
  const positioningStyles = getPositioningStyles(shift, position, isDragging, Optional.from(declaredSize));
  const contextValue = useMemo(() => ({ setShift, draggableRef, isDragging, setIsDragging, setPosition }), [ isDragging ]);

  const setRef = useCallback((element: HTMLDivElement | null) => {
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
    draggableRef.current = element;
  }, [ ref ]);

  return (
    <DraggableContext.Provider value={contextValue}>
      <div ref={setRef} style={{ ...style, ...positioningStyles }} { ...props }>
        {children}
      </div>
    </DraggableContext.Provider>
  );
});

const Handle: FC<DraggableHandleProps> = ({ children }) => {
  const dragStartElementRef = useRef<Element | null>(null);
  const lastMousePositionRef = useRef<Position>({ x: 0, y: 0 });
  const boundariesRef = useRef<Boundaries>({ x: { min: 0, max: 0 }, y: { min: 0, max: 0 }});
  const { setShift, draggableRef, isDragging, setIsDragging, setPosition } = useDraggable();

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    setShift({ x: 0, y: 0 });
    if (draggableRef.current !== null) {
      const rect = draggableRef.current.getBoundingClientRect();
      setPosition({ x: Math.round(rect.left), y: Math.round(rect.top) });
    }
  }, [ setIsDragging, setShift, draggableRef, setPosition ]);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (draggableRef.current === null) {
      // If draggableRef is not present then abort dragging
      return;
    }
    setIsDragging(true);
    dragStartElementRef.current = event.target as Element;
    dragStartElementRef.current.setPointerCapture(event.pointerId);
    const mousePosition = { x: Math.round(event.clientX), y: Math.round(event.clientY) };
    lastMousePositionRef.current = mousePosition;
    const draggableRect = draggableRef.current.getBoundingClientRect();
    boundariesRef.current = boundaries(draggableRect, mousePosition, { x: 0, y: 0 }, { x: document.documentElement.clientWidth, y: document.documentElement.clientHeight });
  }, [ draggableRef, setIsDragging ]);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (isDragging) {
      const currentPointerPosition = {
        x: clamp(Math.round(event.clientX), boundariesRef.current.x.min, boundariesRef.current.x.max),
        y: clamp(Math.round(event.clientY), boundariesRef.current.y.min, boundariesRef.current.y.max)
      };
      const { deltaX, deltaY } = delta(lastMousePositionRef.current, currentPointerPosition);
      lastMousePositionRef.current = currentPointerPosition;
      setShift(({ x, y }) => ({ x: x + deltaX, y: y + deltaY }));
    }
  }, [ isDragging, setShift ]);

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    dragStartElementRef.current?.releasePointerCapture(event.pointerId);
    stopDragging();
  }, [ stopDragging ]);

  /* This is a workaround for chromium bug where lostPointerCapture event is called, without pointerUp */
  const onLostPointerCapture = useCallback(() => {
    if (isDragging) {
      stopDragging();
    }
  }, [ stopDragging, isDragging ]);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onLostPointerCapture={onLostPointerCapture}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}>
      {children}
    </div>
  );
};

export { Root, Handle };
