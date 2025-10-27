import type { CSSProperties, HTMLAttributes, MouseEventHandler, ReactNode, RefObject } from 'react';

export interface ContextToolbarProps {
  readonly children: HTMLAttributes<HTMLDivElement>['children'];
  readonly persistent?: boolean;
}

export interface ContextToolbarContextValue {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly triggerRef: RefObject<HTMLDivElement>;
  readonly toolbarRef: RefObject<HTMLDivElement>;
  readonly persistent: boolean;
}

export interface ToolbarProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onMouseDown?: MouseEventHandler<HTMLDivElement>;
}

export interface TriggerProps {
  readonly children: ReactNode;
  readonly onClick?: MouseEventHandler<HTMLDivElement>;
  readonly onMouseDown?: MouseEventHandler<HTMLDivElement>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export interface GroupProps {
  readonly children: ReactNode;
}
