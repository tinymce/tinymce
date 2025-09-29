import { Fun } from '@ephox/katamari';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';

interface Position {
  x: number; y: number;
};

interface Boundries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

interface DraggableState {
  setShift: React.Dispatch<React.SetStateAction<Position>>;
  shift: Position;
  draggableRef: React.RefObject<HTMLElement>;
};

interface DraggableProps extends PropsWithChildren { }
interface DraggableHandleProps extends PropsWithChildren { }

const initialState: DraggableState = { setShift: Fun.noop, draggableRef: { current: null }, shift: { x: 0, y: 0 }};

const DraggableContext = createContext<DraggableState>(initialState);

const useDraggable = () => {
  const context = useContext(DraggableContext);
  if (!context) {
    throw new Error('Draggable compound components must be rendered within the Draggable component');
  }
  return context;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getBoundries = (positionInfo: { x: number; y: number; width: number; height: number }) => ({
  minX: -positionInfo.x,
  maxX: window.innerWidth - positionInfo.x - positionInfo.width,
  minY: -positionInfo.y,
  maxY: window.innerHeight - positionInfo.y - positionInfo.height
});

const Draggable: React.FC<DraggableProps> & { Handle: React.FC<PropsWithChildren> } = ({ children }) => {
  const [ shift, setShift ] = useState<Position>({ x: 0, y: 0 });
  const draggableRef = useRef<HTMLDivElement>(null);
  const contextValue = useMemo(() => ({ setShift, draggableRef, shift }), [ shift ]);

  return (
    <DraggableContext.Provider value={contextValue}>
      <div ref={draggableRef} style={{
        transform: `translate3d(${shift.x}px, ${shift.y}px, 0)`
      }}>
        {children}
      </div>
    </DraggableContext.Provider>
  );
};

const DraggableHandle: React.FC<DraggableHandleProps> = ({ children }) => {
  const { shift, setShift, draggableRef } = useDraggable();
  const [ isDragging, setIsDragging ] = useState(false);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const startMousePos = useRef<Position>({ x: 0, y: 0 });
  const boundriesRef = useRef<Boundries>({ maxX: 0, maxY: 0, minX: 0, minY: 0 });

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (!draggableRef.current || !handleRef.current) {
      // If draggableRef is not available, we cannot properly calculate the boundries.
      // So let's abort dragging whatsover.
      return;
    }
    setIsDragging(true);
    const currentRect = draggableRef.current.getBoundingClientRect();
    boundriesRef.current = getBoundries({
      x: currentRect.x - shift.x,
      y: currentRect.y - shift.y,
      width: currentRect.width,
      height: currentRect.height
    });
    handleRef.current.setPointerCapture(event.pointerId);
    startMousePos.current = { x: event.clientX, y: event.clientY };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ draggableRef, isDragging ]);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (isDragging) {
      event.stopPropagation();
      const deltaX = (event.clientX - startMousePos.current.x);
      const deltaY = (event.clientY - startMousePos.current.y);
      startMousePos.current = { x: event.clientX, y: event.clientY };

      setShift((previousShift) => {
        // Boundries ref could be a function and we could execute that function here
        const { minX, minY, maxX, maxY } = boundriesRef.current;
        const newX = Math.round(previousShift.x + deltaX);
        const newY = Math.round(previousShift.y + deltaY);

        return {
          x: clamp(newX, minX, maxX),
          y: clamp(newY, minY, maxY)
        };
      });
    }
  }, [ setShift, isDragging ]);

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    setIsDragging(false);
    handleRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  const onLostPointerCapture = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onLostPointerCapture={onLostPointerCapture}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      ref={handleRef}
    >{ children }</div>
  );
};

Draggable.Handle = DraggableHandle;

export { Draggable };
