import type { CSSProperties } from 'react';

const getMaxHeight = (side: 'top' | 'bottom', anchorRect: DOMRect, boundaryRect: DOMRect): number => {
  if (side === 'top') {
    return anchorRect.top - boundaryRect.top;
  } else {
    return boundaryRect.bottom - anchorRect.bottom;
  }
};

const getMaxWidth = (side: 'left' | 'right', anchorRect: DOMRect, boundaryRect: DOMRect): number => {
  if (side === 'left') {
    return anchorRect.left - boundaryRect.left;
  } else {
    return boundaryRect.right - anchorRect.right;
  }
};

interface GetPositionStylesProps {
  readonly anchorRect: DOMRect;
  readonly anchoredContainerRect: DOMRect;
  readonly side: 'top' | 'bottom' | 'left' | 'right';
  readonly align: 'start' | 'center' | 'end';
  readonly gap: number;
  readonly boundaryRect?: DOMRect;
}

const getPositionStyles = ( {
  anchorRect,
  anchoredContainerRect,
  side,
  align,
  gap,
  boundaryRect = document.documentElement.getBoundingClientRect()
}: GetPositionStylesProps): CSSProperties => {

  if (side === 'top' || side === 'bottom') {
    const maxHeight = getMaxHeight(side, anchorRect, boundaryRect);
    const top = side === 'top' ? anchorRect.top - anchoredContainerRect.height - gap : anchorRect.bottom + gap;

    // 'start' as a staring point
    let left: number = anchorRect.left;

    if (align === 'center') {
      left = (anchorRect.left + anchorRect.width / 2) - anchoredContainerRect.width / 2;
    }

    if (align === 'end') {
      left = anchorRect.right - anchoredContainerRect.width;
    }

    return {
      maxHeight: `${maxHeight}px`,
      top: `${top}px`,
      left: `${left}px`,
      width: `${anchorRect.width}px`
    };
  }

  if (side === 'left' || side === 'right') {
    const maxWidth = getMaxWidth(side, anchorRect, boundaryRect);
    const left = side === 'left' ? anchorRect.left - anchoredContainerRect.width - gap : anchorRect.right + gap;

    // 'start' as a staring point
    let top: number = anchorRect.top;

    if (align === 'center') {
      top = (anchorRect.top - anchoredContainerRect.width / 2 ) + anchorRect.width / 2;
    }

    if (align === 'end') {
      top = anchorRect.bottom - anchoredContainerRect.height;
    }

    return {
      maxWidth: `${maxWidth}px`,
      top: `${top}px`,
      left: `${left}px`
    };
  }

  return {};
};

export {
  getPositionStyles
};
