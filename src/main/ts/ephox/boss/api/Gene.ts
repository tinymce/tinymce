export interface Gene {
  id: string;
  name: string;
  children: Gene[];
  css: Record<string, string>;
  attrs: Record<string, string>;
  text?: string;
  parent?: Gene;
  random?: number;
}

export const Gene = function (id: string, name: string, children: Gene[] = [], css: Record<string, string> = {}, attrs: Record<string, string> = {}, text?: string): Gene {
  return {
    id,
    name,
    children,
    css,
    attrs,
    text,
  };
};