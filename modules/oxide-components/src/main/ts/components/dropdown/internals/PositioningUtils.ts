const getPositionSide = (side: 'top' | 'bottom' | 'left' | 'right') => {
  switch (side) {
    case 'top':
      return 'block-start';
    case 'bottom':
      return 'block-end';
    case 'left':
      return 'inline-start';
    case 'right':
      return 'inline-end';
  }
};

const getPositionArea = (side: 'top' | 'bottom' | 'left' | 'right', align: 'start' | 'center' | 'end'): string => {
  const positionSide = getPositionSide(side);
  const horizontalLayout = side === 'top' || side === 'bottom';
  const row = horizontalLayout ? 'inline' : 'block';
  switch (align) {
    case 'start':
      return `${positionSide} span-${row}-end`;
    case 'end':
      return `${positionSide} span-${row}-start`;
    case 'center':
      return positionSide;
  }
};

const getInset = (side: 'top' | 'bottom' | 'left' | 'right', gap: number): { insetBlock?: number; insetInline?: number } => {
  switch (side) {
    case 'top':
    case 'bottom':
      return { insetBlock: gap };
    case 'left':
    case 'right':
      return { insetInline: gap };
  }
};

export {
  getInset,
  getPositionArea
};
