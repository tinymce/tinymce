import type { HTMLAttributes, MouseEventHandler, ReactNode, RefObject } from 'react';

export interface ContextToolbarProps {
  readonly children: HTMLAttributes<HTMLDivElement>['children'];
  readonly persistent?: boolean;
  readonly anchorRef?: RefObject<HTMLElement>;
  readonly usePopover?: boolean;
}

export interface ContextToolbarContextValue {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly triggerRef: RefObject<HTMLDivElement>;
  readonly toolbarRef: RefObject<HTMLDivElement>;
  readonly anchorRef?: RefObject<HTMLElement>;
  readonly anchorElement: HTMLElement | null;
  readonly getAnchorElement: () => HTMLElement | null;
  readonly persistent: boolean;
  readonly usePopover: boolean;
}

export interface ToolbarProps {
  readonly children: ReactNode;
  readonly onMouseDown?: MouseEventHandler<HTMLDivElement>;
  readonly onEscape?: () => void;
}

export interface ToolbarHandle {
  readonly focus: () => void;
}

export interface TriggerProps {
  readonly children: ReactNode;
  readonly onClick?: MouseEventHandler<HTMLDivElement>;
  readonly onMouseDown?: MouseEventHandler<HTMLDivElement>;
}

export interface GroupProps {
  readonly children: ReactNode;
  /**
   * Whether the group's arrow-key flow navigation responds to vertical arrows.
   * Defaults to `true`. Set to `false` when the host has its own ArrowUp/ArrowDown
   * semantics (e.g. navigating between items above/below the toolbar), so those
   * keys reach the host handler instead of being consumed for focus movement
   * between buttons within the group.
   */
  readonly allowVertical?: boolean;
}
