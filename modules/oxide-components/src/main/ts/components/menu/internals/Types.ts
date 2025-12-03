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

// Menu items
interface CommmonMenuItem {
  readonly icon?: string;
  readonly text?: string;
  readonly enabled?: boolean;
}

interface ToggleMenuItem extends CommmonMenuItem {
  readonly type: 'togglemenuitem';
  readonly active?: boolean;
  readonly shortcut?: string;
  readonly onAction: (api: ToggleMenuItemInstanceApi) => void;
  readonly onSetup?: (api: ToggleMenuItemInstanceApi) => (api: ToggleMenuItemInstanceApi) => void;
}

interface SimpleMenuItem extends CommmonMenuItem {
  readonly type: 'menuitem';
  readonly shortcut?: string;
  readonly onAction: (api: CommonMenuItemInstanceApi) => void;
  readonly onSetup?: (api: CommonMenuItemInstanceApi) => (api: CommonMenuItemInstanceApi) => void;
}

interface Submenu extends CommmonMenuItem {
  readonly type: 'submenu';
  readonly items: MenuItem[];
  readonly onSetup?: (api: CommonMenuItemInstanceApi) => (api: CommonMenuItemInstanceApi) => void;
}

export type MenuItem = ToggleMenuItem | SimpleMenuItem | Submenu;

// Components Props
export interface ToggleMenuItemProps extends Omit<ToggleMenuItem, 'type'> {
  iconResolver: (icon: string) => string;
  autoFocus?: boolean;
}

export interface SimpleMenuItemProps extends Omit<SimpleMenuItem, 'type'> {
  iconResolver: (icon: string) => string;
  autoFocus?: boolean;
}

export interface SubmenuProps extends Omit<Submenu, 'items' | 'type'>, PropsWithChildren {
  iconResolver: (icon: string) => string;
  readonly submenusSide?: 'left' | 'right';
  autoFocus?: boolean;
}

