import { Menu as BridgeMenu } from '@ephox/bridge';

export type SingleMenuItemApi = BridgeMenu.MenuItemApi | BridgeMenu.NestedMenuItemApi | BridgeMenu.ToggleMenuItemApi |
  BridgeMenu.SeparatorMenuItemApi | BridgeMenu.ChoiceMenuItemApi | BridgeMenu.FancyMenuItemApi;