import { Optional } from '@ephox/katamari';

export interface Gene {
  id: string;
  name: string;
  children: Gene[];
  css: Record<string, string>;
  attrs: Record<string, string>;
  text?: string;
  parent: Optional<Gene>;
  random?: number;
}

export const Gene = (id: string, name: string, children: Gene[] = [], css: Record<string, string> = {}, attrs: Record<string, string> = {}, text?: string): Gene => {
  const parent = Optional.none<Gene>();
  return {
    id,
    name,
    children,
    css,
    attrs,
    text,
    parent
  };
};
