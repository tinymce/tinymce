import { Arr, Obj, Optional } from '@ephox/katamari';

import Tools from '../api/util/Tools';
import { Attribute, AttributePattern, SchemaElement } from './SchemaTypes';
import * as SchemaUtils from './SchemaUtils';

export interface SchemaElementPair {
  readonly name: string;
  readonly element: SchemaElement;
  readonly aliasName?: string;
}

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

      const element: SchemaElement = {
        attributes: {},
        attributesOrder: []
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
      if (elementName === '@') {
        // We only care about the first one
        if (globalElement.isNone()) {
          globalElement = Optional.some(element);
        } else {
          return [];
        }
      }

      return [ outputName ? { name: elementName, element, aliasName: outputName } : { name: elementName, element } ];
    } else {
      return [];
    }
  });
};

