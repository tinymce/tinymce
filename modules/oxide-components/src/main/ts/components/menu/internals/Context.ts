import { createContext, useContext } from 'react';

export interface MenuState {
  readonly activeItemId: string | null;
  readonly setActiveItemId: (id: string | null) => void;
}

const MenuContext = createContext<MenuState | null>(null);

const useMenu = (): MenuState => {
  const context = useContext(MenuContext);
  if (context === null) {
    throw new Error('Menu compound components must be rendered within the Menu component');
  }
  return context;
};

export { useMenu, MenuContext };
