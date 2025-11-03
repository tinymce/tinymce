import type { HTMLAttributes, MouseEventHandler, ReactNode, RefObject } from 'react';

export type ContextToolbarProps = {
  readonly children: HTMLAttributes<HTMLDivElement>['children'];
  readonly persistent?: boolean;
  readonly anchorRef?: RefObject<HTMLElement>;
} & (
  | {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
  }
  | {
    readonly open?: never;
    readonly onOpenChange?: never;
  }
);

export interface ContextToolbarContextValue {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly triggerRef: RefObject<HTMLDivElement>;
  readonly toolbarRef: RefObject<HTMLDivElement>;
  readonly anchorRef?: RefObject<HTMLElement>;
  readonly getAnchorElement: () => HTMLElement | null;
  readonly persistent: boolean;
}

export interface ToolbarProps {
  readonly children: ReactNode;
  readonly onMouseDown?: MouseEventHandler<HTMLDivElement>;
}

export interface TriggerProps {
  readonly children: ReactNode;
  readonly onClick?: MouseEventHandler<HTMLDivElement>;
  readonly onMouseDown?: MouseEventHandler<HTMLDivElement>;
}

export interface GroupProps {
  readonly children: ReactNode;
}
