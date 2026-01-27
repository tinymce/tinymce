import type { PropsWithChildren } from 'react';

// Menu items APIs
export interface CommonMenuItemInstanceApi {
  isEnabled: () => boolean;
  setEnabled: (state: boolean) => void;
}

export interface ToggleMenuItemInstanceApi extends CommonMenuItemInstanceApi {
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

// Item components Props
export interface ToggleMenuItemProps extends PropsWithChildren {
  autoFocus?: boolean;
  readonly icon?: string | JSX.Element;
  readonly enabled?: boolean;
  readonly active?: boolean;
  readonly shortcut?: string;
  readonly onAction: (api: ToggleMenuItemInstanceApi) => void;
  readonly onSetup?: (api: ToggleMenuItemInstanceApi) => (api: ToggleMenuItemInstanceApi) => void;
}

export interface MenuItemProps extends PropsWithChildren {
  autoFocus?: boolean;
  readonly icon?: string | JSX.Element;
  readonly enabled?: boolean;
  readonly shortcut?: string;
  readonly onAction: (api: CommonMenuItemInstanceApi) => void;
  readonly onSetup?: (api: CommonMenuItemInstanceApi) => (api: CommonMenuItemInstanceApi) => void;
}

export interface SubmenuProps extends PropsWithChildren {
  autoFocus?: boolean;
  readonly submenusSide?: 'left' | 'right';
  readonly icon?: string | JSX.Element;
  readonly enabled?: boolean;
  readonly submenuContent: JSX.Element;
  readonly onSetup?: (api: CommonMenuItemInstanceApi) => (api: CommonMenuItemInstanceApi) => void;
}

