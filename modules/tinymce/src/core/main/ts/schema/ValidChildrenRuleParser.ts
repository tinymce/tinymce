import { Arr } from '@ephox/katamari';

import * as SchemaUtils from './SchemaUtils';

export type ValidChildrenOperation = 'replace' | 'add' | 'remove';

export interface ValidChildrenRule {
  readonly operation: ValidChildrenOperation;
  readonly name: string;
  readonly validChildren: string[];
}

const prefixToOperation = (prefix: string): ValidChildrenOperation => prefix === '-' ? 'remove' : 'add';

export const parseValidChildrenRules = (value: string): ValidChildrenRule[] => {
  // see: https://html.spec.whatwg.org/#valid-custom-element-name
  const childRuleRegExp = /^([+\-]?)([A-Za-z0-9_\-.\u00b7\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u037d\u037f-\u1fff\u200c-\u200d\u203f-\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]+)\[([^\]]+)]$/; // from w3c's custom grammar (above)
  return Arr.bind(SchemaUtils.split(value, ','), (rule) => {
    const matches = childRuleRegExp.exec(rule);

    if (matches) {
      const prefix = matches[1];
      const operation = prefix ? prefixToOperation(prefix) : 'replace';
      const name = matches[2];
      const validChildren = SchemaUtils.split(matches[3], '|');

      return [{ operation, name, validChildren }];
    } else {
      return [];
    }
  });
};

