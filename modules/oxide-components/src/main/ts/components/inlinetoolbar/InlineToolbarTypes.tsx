import type { ReactNode, RefObject } from 'react';

export interface InlineToolbarProps {
  readonly children: ReactNode;
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

export interface ToolbarProps {
  readonly children: ReactNode;
}

export interface TriggerProps {
  readonly children: ReactNode;
}