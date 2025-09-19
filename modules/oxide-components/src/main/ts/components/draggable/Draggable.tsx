import { Fun } from '@ephox/katamari';
import React, { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from 'react';

interface Position {
  x: number; y: number;
};

interface DraggableState {
  position: Position;
  isDragging: boolean;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
};

interface DraggableProps extends PropsWithChildren {
}

const initialState: DraggableState = {
  position: { x: 0, y: 0 },
  isDragging: false,
  setPosition: Fun.noop,
  setIsDragging: Fun.noop
};

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
  const [ isDragging, setIsDragging ] = useState(false);
  const contextValue = { position, isDragging, setPosition, setIsDragging };

  return (
    <DraggableContext.Provider value={contextValue}>
      <div
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x
        }}
      >
        {children}
      </div>
    </DraggableContext.Provider>
  );
};

interface DraggableHandleProps extends PropsWithChildren {}

const DraggableHandle: React.FC<DraggableHandleProps> = ({ children }) => {
  const { setPosition, position } = useDraggable();
  const [ isDragging, setIsDragging ] = useState(false);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const startMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startDraggablePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    setIsDragging(true);
    handleRef.current?.setPointerCapture(event.pointerId);
    // TODO: I don't need that
    // startDraggablePosition.current = { x: position.x, y: position.y };

    startMousePos.current = { x: event.clientX, y: event.clientY };
  }, [ ]);

  const onDragging = useCallback((event: React.PointerEvent) => {
    event.stopPropagation();

    const deltaX = (event.clientX - startMousePos.current.x);
    const deltaY = (event.clientY - startMousePos.current.y);
    startMousePos.current = { x: event.clientX, y: event.clientY };
    // setPosition({ x: startDraggablePosition.current.x + deltaX, y: startDraggablePosition.current.y + deltaY });
    setPosition((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
  }, [ setPosition ]);

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    setIsDragging(false);
    handleRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={isDragging ? onDragging : undefined}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      ref={handleRef}
    >
      <>{children}</>
    </div>
  );
};

// TODO: Draggable.Handle
export { Draggable, DraggableHandle };
