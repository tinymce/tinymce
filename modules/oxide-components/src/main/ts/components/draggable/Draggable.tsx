import { type FC, useState, useMemo, useRef, useCallback } from 'react';

import { delta, round } from './internals/calculations';
import { useDraggable, DraggableContext } from './internals/context';
import type { DraggableProps, DraggableHandleProps, Shift, Position } from './internals/types';

const Draggable: FC<DraggableProps> & { Handle: FC<DraggableHandleProps> } = ({ children }) => {
  const [ shift, setShift ] = useState<Shift>({ x: 0, y: 0 });
  const transform = `translate3d(${shift.x}px, ${shift.y}px, 0)`;
  const contextValue = useMemo(() => ({ setShift }), []);

  return (
    <DraggableContext.Provider value={contextValue}>
      <div style={{ transform }}>
        {children}
      </div>
    </DraggableContext.Provider>
  );
};

const DraggableHandle: FC<DraggableHandleProps> = ({ children }) => {
  const [ isDragging, setIsDragging ] = useState(false);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const lastMousePosition = useRef<Position>({ x: 0, y: 0 });
  const { setShift } = useDraggable();

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (handleRef.current === null) {
      // If handle ref is not present then abort dragging
      return;
    }
    setIsDragging(true);
    handleRef.current.setPointerCapture(event.pointerId);
    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (isDragging) {
      const currentPointerPosition = { x: event.clientX, y: event.clientY };
      const { deltaX, deltaY } = delta(lastMousePosition.current, currentPointerPosition);
      lastMousePosition.current = currentPointerPosition;
      setShift(({ x, y }) => round({ x: x + deltaX, y: y + deltaY }));
    }
  }, [ isDragging, setShift ]);

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    handleRef.current?.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  }, []);

  /* This is a workaround for chromium bug where lostPointerCapture event is called, without pointerUp */
  const onLostPointerCapture = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={handleRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onLostPointerCapture={onLostPointerCapture}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}>
      {children}
    </div>
  );
};

Draggable.Handle = DraggableHandle;

export { Draggable };
