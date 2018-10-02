import { Element } from "@ephox/dom-globals";
import { SeparatorMenuItemApi } from "../../api/Menu";

export interface ContextMenuItem {
  text: string;
  icon?: string;
  type?: 'item';
  onAction: () => void;
}

export interface ContextSubMenu {
  type: 'submenu';
  text: string;
  icon?: string;
  getSubmenuItems: () => Array<ContextMenuContents>;
}

export type ContextMenuContents = string | ContextMenuItem | SeparatorMenuItemApi | ContextSubMenu

export interface ContextMenuApi {
  update: (element: Element) => Array<ContextMenuContents>
};