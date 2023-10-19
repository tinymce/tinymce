export type NamespaceType = 'html' | 'svg';

export interface NamespaceTracker {
  readonly track: (node: Node) => NamespaceType;
  readonly current: () => NamespaceType;
  readonly reset: () => void;
}

export const isNonHtmlElementRootName = (name: string): boolean => name.toLowerCase() === 'svg';

export const isNonHtmlElementRoot = (node: Node): boolean => isNonHtmlElementRootName(node.nodeName);

export const toScopeType = (node: Node | undefined): NamespaceType => node?.nodeName === 'svg' ? 'svg' : 'html';

export const namespaceElements = [ 'svg' ];

export const createNamespaceTracker = (): NamespaceTracker => {
  let scopes: Node[] = [];

  const peek = () => scopes[scopes.length - 1];

  const track = (node: Node): NamespaceType => {
    if (isNonHtmlElementRoot(node)) {
      scopes.push(node);
    }

    let currentScope: Node | undefined = peek();
    if (currentScope && !currentScope.contains(node)) {
      scopes.pop();
      currentScope = peek();
    }

    return toScopeType(currentScope);
  };

  const current = () => toScopeType(peek());

  const reset = () => {
    scopes = [];
  };

  return {
    track,
    current,
    reset
  };
};
