import type { HTMLAttributes, RefObject } from 'react';

export interface InlineToolbarProps {
  readonly children: HTMLAttributes<HTMLDivElement>['children'];
  readonly sinkRef: RefObject<HTMLDivElement>;
  readonly persistent?: boolean;
}

export interface InlineToolbarContextValue {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly triggerRef: RefObject<HTMLDivElement>;
  readonly toolbarRef: RefObject<HTMLDivElement>;
  readonly sinkRef: RefObject<HTMLDivElement>;
  readonly persistent: boolean;
}

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {}

export type TriggerProps = HTMLAttributes<HTMLDivElement>;
