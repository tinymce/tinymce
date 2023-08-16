import { Arr, Obj, Optional } from '@ephox/katamari';

import Tools from '../api/util/Tools';
import { Attribute, AttributePattern, SchemaElement } from './SchemaTypes';
import * as SchemaUtils from './SchemaUtils';

export interface CustomElementRules {
  readonly inline: boolean;
  readonly cloneName: 'div' | 'span';
  readonly name: string;
}

export type ValidChildrenOperation = 'replace' | 'add' | 'remove';

export interface ValidChildrenRule {
  readonly operation: ValidChildrenOperation;
  readonly name: string;
  readonly children: string[];
}

export interface SchemaElementPair {
  readonly name: string;
  readonly element: SchemaElement;
}

export const parseCustomElementsRules = (value: string): CustomElementRules[] => {
  const customElementRegExp = /^(~)?(.+)$/;
  return Arr.bind(SchemaUtils.split(value, ','), (rule) => {
    const matches = customElementRegExp.exec(rule);
    if (matches) {
      const inline = matches[1] === '~';
      const cloneName = inline ? 'span' : 'div';
      const name = matches[2];

      return [{ inline, cloneName, name }];
    } else {
      return [];
    }
  });
};

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
      const children = SchemaUtils.split(matches[3], '|');

      return [{ operation, name, children }];
    } else {
      return [];
    }
  });
};

const parseValidElementsAttrDataIntoElement = (attrData: string, targetElement: SchemaElement) => {
  const attrRuleRegExp = /^([!\-])?(\w+[\\:]:\w+|[^=~<]+)?(?:([=~<])(.*))?$/;
  const hasPatternsRegExp = /[*?+]/;
  const { attributes, attributesOrder } = targetElement;

  return Arr.each(SchemaUtils.split(attrData, '|'), (rule) => {
    const matches = attrRuleRegExp.exec(rule);

    if (matches) {
      const attr: Attribute = {};
      const attrType = matches[1];
      const attrName = matches[2].replace(/[\\:]:/g, ':');
      const attrPrefix = matches[3];
      const value = matches[4];

      // Required
      if (attrType === '!') {
        targetElement.attributesRequired = targetElement.attributesRequired || [];
        targetElement.attributesRequired.push(attrName);
        attr.required = true;
      }

      // Denied from global
      if (attrType === '-') {
        delete attributes[attrName];
        attributesOrder.splice(Tools.inArray(attributesOrder, attrName), 1);
        return;
      }

      // Default value
      if (attrPrefix) {
        if (attrPrefix === '=') { // Default value
          targetElement.attributesDefault = targetElement.attributesDefault || [];
          targetElement.attributesDefault.push({ name: attrName, value });
          attr.defaultValue = value;
        } else if (attrPrefix === '~') {// Forced value
          targetElement.attributesForced = targetElement.attributesForced || [];
          targetElement.attributesForced.push({ name: attrName, value });
          attr.forcedValue = value;
        } else if (attrPrefix === '<') { // Required values
          attr.validValues = Tools.makeMap(value, '?');
        }
      }

      // Check for attribute patterns
      if (hasPatternsRegExp.test(attrName)) {
        const attrPattern = attr as AttributePattern;
        targetElement.attributePatterns = targetElement.attributePatterns || [];
        attrPattern.pattern = SchemaUtils.patternToRegExp(attrName);
        targetElement.attributePatterns.push(attrPattern);
      } else {
        // Add attribute to order list if it doesn't already exist
        if (!attributes[attrName]) {
          attributesOrder.push(attrName);
        }

        attributes[attrName] = attr;
      }
    }
  });
};

const cloneAttributesInto = (from: SchemaElement, to: SchemaElement) => {
  Obj.each(from.attributes, (value, key) => {
    to.attributes[key] = value;
  });

  to.attributesOrder.push(...from.attributesOrder);
};

export const parseValidElementsRules = (globalElement: Optional<SchemaElement>, validElements: string): SchemaElementPair[] => {
  const elementRuleRegExp = /^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)])?$/;

  return Arr.bind(SchemaUtils.split(validElements, ','), (rule) => {
    const matches = elementRuleRegExp.exec(rule);

    if (matches) {
      const prefix = matches[1];
      const elementName = matches[2];
      const outputName = matches[3];
      const attrsPrefix = matches[4];
      const attrData = matches[5];

      const attributes: Record<string, Attribute> = {};
      const attributesOrder: string[] = [];

      const element: SchemaElement = {
        attributes,
        attributesOrder
      };

      globalElement.each((el) => cloneAttributesInto(el, element));

      if (prefix === '#') {
        element.paddEmpty = true;
      } else if (prefix === '-') {
        element.removeEmpty = true;
      }

      if (attrsPrefix === '!') {
        element.removeEmptyAttrs = true;
      }

      if (attrData) {
        parseValidElementsAttrDataIntoElement(attrData, element);
      }

      // Handle substitute elements such as b/strong
      if (outputName) {
        element.outputName = elementName;
      }

      // Mutate the local globalElement option state if we find a global @ rule
      if (globalElement.isNone() && elementName === '@') {
        globalElement = Optional.some(element);
      }

      return [{ name: elementName, element }];
    } else {
      return [];
    }
  });
};
