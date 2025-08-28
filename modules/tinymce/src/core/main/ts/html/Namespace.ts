import { Singleton } from '@ephox/katamari';

export type NamespaceType = 'html' | 'svg' | 'math';

export interface NamespaceTracker {
  readonly track: (node: Node) => NamespaceType;
  readonly current: () => NamespaceType;
  readonly reset: () => void;
}

const nodeNameToNamespaceType = (name: string): NamespaceType => {
  const lowerCaseName = name.toLowerCase();

  if (lowerCaseName === 'svg') {
    return 'svg';
  } else if (lowerCaseName === 'math') {
    return 'math';
  } else {
    return 'html';
  }
};

export const isNonHtmlElementRootName = (name: string): boolean => nodeNameToNamespaceType(name) !== 'html';

export const isNonHtmlElementRoot = (node: Node): boolean => isNonHtmlElementRootName(node.nodeName);

export const toScopeType = (node: Node): NamespaceType => nodeNameToNamespaceType(node.nodeName);

export const namespaceElements = [ 'svg', 'math' ];

export const createNamespaceTracker = (): NamespaceTracker => {
  const currentScope = Singleton.value<Node>();

  const current = () => currentScope.get().map(toScopeType).getOr('html');

  const track = (node: Node): NamespaceType => {
    if (isNonHtmlElementRoot(node)) {
      currentScope.set(node);
    } else if (currentScope.get().exists((scopeNode) => !scopeNode.contains(node))) {
      currentScope.clear();
    }

    return current();
  };

  const reset = () => {
    currentScope.clear();
  };

  return {
    track,
    current,
    reset
  };
};
