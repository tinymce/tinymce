import { SeparatorMenuItemSpec } from '../../api/Menu';
import { CommonMenuItemSpec } from './CommonMenuItem';

export interface ContextMenuItem extends CommonMenuItemSpec {
  text: string;
  icon?: string;
  type?: 'item';
  onAction: () => void;
}

export interface ContextSubMenu extends CommonMenuItemSpec {
  type: 'submenu';
  text: string;
  icon?: string;
  getSubmenuItems: () => string | Array<ContextMenuContents>;
}

export type ContextMenuContents = string | ContextMenuItem | SeparatorMenuItemSpec | ContextSubMenu;

export interface ContextMenuApi {
  update: (element: Element) => string | Array<ContextMenuContents>;
}
