interface Mouse {
  down: () => void;
  move: (vector: readonly [number, number]) => void;
  up: () => void;
}

const mouse = (element: HTMLElement): Mouse => {
  const rect = element.getBoundingClientRect();
  const position = { x: rect.x, y: rect.y };

  const down = () => {
    element.dispatchEvent(new window.PointerEvent('pointerdown', {
      clientX: position.x,
      clientY: position.y,
      pointerId: 1,
      bubbles: true
    }));
  };

  const move = (vector: readonly [number, number]) => {
    position.x = position.x + vector[0];
    position.y = position.y + vector[1];

    element.dispatchEvent(new window.PointerEvent('pointermove', {
      clientX: position.x,
      clientY: position.y,
      pointerId: 1,
      bubbles: true
    }));
  };

  const up = () => {
    element.dispatchEvent(new window.PointerEvent('pointerup', {
      clientX: position.x,
      clientY: position.y,
      pointerId: 1,
      bubbles: true
    }));
  };

  return { down, move, up };
};

/*
  I would prefer to use React's 'act' function.
  But I couldn't find a way to use 'act' with 'vitest-browser-react' library,
  without having error message on the console.
*/
const tick = (): Promise<void> => new Promise<void>((res) => setTimeout(() => res()));

export { mouse, tick };
