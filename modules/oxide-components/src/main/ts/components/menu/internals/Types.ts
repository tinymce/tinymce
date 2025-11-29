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
export interface ToggleMenuItemProps extends ToggleMenuItem {
  id: string;
  iconResolver: (icon: string) => string;
}

export interface SimpleMenuItemProps extends SimpleMenuItem {
  id: string;
  iconResolver: (icon: string) => string;
}

export interface SubmenuProps extends Submenu {
  id: string;
  iconResolver: (icon: string) => string;
  readonly submenusSide?: 'left' | 'right';
}

export interface MenuProps {
  readonly items: MenuItem[];
  /*
   * The function to resolve the icon name to an html string.
   * This would eventually default to retrieving the icon from the editor's registry.
   * (name: string) => editor.ui.registry.getAll().icons[name] ?? 'temporary-placeholder'
   *
   * @param icon - The name of the icon
   * @returns The html string representation of the icon
   */
  readonly iconResolver: (icon: string) => string;
  readonly submenusSide?: 'left' | 'right';
  readonly autoFocus?: boolean;
}
