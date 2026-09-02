import { UniverseProvider, type UniverseResources } from 'oxide-components/Main';
import * as Bem from 'oxide-components/utils/Bem';
import type { ReactNode } from 'react';

const ID_ATTRIBUTES = [
  'id',
  'for',
  'aria-controls',
  'aria-labelledby',
  'aria-describedby',
  'aria-activedescendant',
  'aria-owns'
];
const REACT_ID = /:r[0-9a-z]+:/g;
const ANCHOR_NAME = /--[a-z-]+_\d+/g;

// Replaces dynamically generated values (ids, anchor names, etc.) with static ones
// and normalizes positions
const normalize = (fragment: DocumentFragment): DocumentFragment => {
  const seen = new Map<string, string>();
  const stableId = (raw: string): string => {
    const existing = seen.get(raw);
    if (existing !== undefined) {
      return existing;
    }
    const next = `:id-${seen.size}:`;
    seen.set(raw, next);
    return next;
  };

  fragment.querySelectorAll('*').forEach((el) => {
    ID_ATTRIBUTES.forEach((attr) => {
      const value = el.getAttribute(attr);
      if (value !== null) {
        const normalized = value.replace(REACT_ID, stableId);
        if (normalized !== value) {
          el.setAttribute(attr, normalized);
        }
      }
    });

    const style = el.getAttribute('style');
    if (style !== null) {
      const normalized = style.replace(ANCHOR_NAME, '--test-anchor');
      if (normalized !== style) {
        el.setAttribute('style', normalized);
      }
    }
  });

  return fragment;
};

const stubIconUniverse: UniverseResources = { getIcon: (icon: string): string => `<svg id="${icon}"></svg>` };

const snapshotWrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <div className={Bem.block('tox')}>
    <UniverseProvider resources={stubIconUniverse}>
      {children}
    </UniverseProvider>
  </div>
);

export { normalize, stubIconUniverse, snapshotWrapper };
