import { type FC, useState, useMemo, useRef, useCallback } from 'react';

import { boundries, clamp, delta, undoShift } from './internals/calculations';
import { useDraggable, DraggableContext } from './internals/context';
import type { DraggableProps, DraggableHandleProps, Shift, Position, Boundries } from './internals/types';

const Draggable: FC<DraggableProps> & { Handle: FC<DraggableHandleProps> } = ({ children }) => {
  const [ shift, setShift ] = useState<Shift>({ x: 0, y: 0 });
  const draggableRef = useRef<HTMLDivElement | null>(null);
  const transform = `translate3d(${shift.x}px, ${shift.y}px, 0)`;
  const contextValue = useMemo(() => ({ shift, setShift, draggableRef }), [ shift ]);

  return (
    <DraggableContext.Provider value={contextValue}>
      <div ref={draggableRef} style={{ transform }}>
        {children}
      </div>
    </DraggableContext.Provider>
  );
};

const DraggableHandle: FC<DraggableHandleProps> = ({ children }) => {
  const [ isDragging, setIsDragging ] = useState(false);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const lastMousePositionRef = useRef<Position>({ x: 0, y: 0 });
  const boundriesRef = useRef<Boundries>({ shiftX: { min: 0, max: 0 }, shiftY: { min: 0, max: 0 }});
  const { setShift, draggableRef, shift } = useDraggable();

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (handleRef.current === null || draggableRef.current === null) {
      // If handleRef or draggableRef is not present then abort dragging
      return;
    }
    setIsDragging(true);
    handleRef.current.setPointerCapture(event.pointerId);
    lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
    const draggableRect = draggableRef.current.getBoundingClientRect();
    const currentRect = undoShift(draggableRect, shift);
    boundriesRef.current = boundries(currentRect, { x: 0, y: 0 }, { x: window.innerWidth, y: window.innerHeight });
  }, [ draggableRef, shift ]);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (isDragging) {
      const currentPointerPosition = { x: event.clientX, y: event.clientY };
      const { deltaX, deltaY } = delta(lastMousePositionRef.current, currentPointerPosition);
      lastMousePositionRef.current = currentPointerPosition;
      const calculatedBoundries = boundriesRef.current;
      setShift(({ x, y }) => ({
        x: clamp(Math.floor(x + deltaX), calculatedBoundries.shiftX.min, calculatedBoundries.shiftX.max),
        y: clamp(Math.floor(y + deltaY), calculatedBoundries.shiftY.min, calculatedBoundries.shiftY.max)
      }));
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
