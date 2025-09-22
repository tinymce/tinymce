import { Fun } from '@ephox/katamari';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';

interface Position {
  x: number; y: number;
};

interface DraggableState {
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
};

interface DraggableProps extends PropsWithChildren {
}

const initialState: DraggableState = { setPosition: Fun.noop };

const DraggableContext = createContext<DraggableState>(initialState);

const useDraggable = () => {
  const context = useContext(DraggableContext);
  if (!context) {
    throw new Error('Draggable compound components must be rendered within the Draggable component');
  }
  return context;
};

const Draggable: React.FC<DraggableProps> = ({ children }) => {
  const [ position, setPosition ] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const contextValue = useMemo(() => ({ setPosition }), []);

  return (
    <DraggableContext.Provider value={contextValue}>
      <div style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
      }}>
        {children}
      </div>
    </DraggableContext.Provider>
  );
};

interface DraggableHandleProps extends PropsWithChildren {}

const DraggableHandle: React.FC<DraggableHandleProps> = ({ children }) => {
  const { setPosition } = useDraggable();
  const [ isDragging, setIsDragging ] = useState(false);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const startMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    setIsDragging(true);
    handleRef.current?.setPointerCapture(event.pointerId);
    startMousePos.current = { x: event.clientX, y: event.clientY };
  }, [ ]);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (isDragging) {
      event.stopPropagation();
      const deltaX = (event.clientX - startMousePos.current.x);
      const deltaY = (event.clientY - startMousePos.current.y);
      startMousePos.current = { x: event.clientX, y: event.clientY };
      setPosition((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    }
  }, [ setPosition, isDragging ]);

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    setIsDragging(false);
    handleRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      ref={handleRef}
    >{ children }</div>
  );
};

// TODO: Draggable.Handle
export { Draggable, DraggableHandle };
