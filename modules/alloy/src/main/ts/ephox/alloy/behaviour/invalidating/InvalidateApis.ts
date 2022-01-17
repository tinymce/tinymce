import { Arr, Future, Result } from '@ephox/katamari';
import { Attribute, Class, Html, SugarElement, SugarNode } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from '../common/BehaviourState';
import { InvalidatingConfig } from './InvalidateTypes';

const ariaElements = [
  'input',
  'textarea'
];

const isAriaElement = (elem: SugarElement<Node>): elem is SugarElement<HTMLInputElement | HTMLTextAreaElement> => {
  const name = SugarNode.name(elem);
  return Arr.contains(ariaElements, name);
};

const markValid = (component: AlloyComponent, invalidConfig: InvalidatingConfig): void => {
  const elem = invalidConfig.getRoot(component).getOr(component.element);
  Class.remove(elem, invalidConfig.invalidClass);
  invalidConfig.notify.each((notifyInfo) => {
    if (isAriaElement(component.element)) {
      Attribute.set(component.element, 'aria-invalid', false);
    }
    notifyInfo.getContainer(component).each((container) => {
      Html.set(container, notifyInfo.validHtml);
    });

    notifyInfo.onValid(component);
  });
};

const markInvalid = (component: AlloyComponent, invalidConfig: InvalidatingConfig, invalidState: Stateless, text: string): void => {
  const elem = invalidConfig.getRoot(component).getOr(component.element);
  Class.add(elem, invalidConfig.invalidClass);
  invalidConfig.notify.each((notifyInfo) => {
    if (isAriaElement(component.element)) {
      Attribute.set(component.element, 'aria-invalid', true);
    }
    notifyInfo.getContainer(component).each((container) => {
      // TODO: Should we just use Text here, not HTML?
      Html.set(container, text);
    });

    notifyInfo.onInvalid(component, text);
  });
};

const query = (component: AlloyComponent, invalidConfig: InvalidatingConfig, _invalidState: Stateless): Future<Result<any, string>> =>
  invalidConfig.validator.fold(
    () => Future.pure(Result.value(true)),
    (validatorInfo) => validatorInfo.validate(component)
  );

const run = (component: AlloyComponent, invalidConfig: InvalidatingConfig, invalidState: Stateless): Future<Result<any, string>> => {
  invalidConfig.notify.each((notifyInfo) => {
    notifyInfo.onValidate(component);
  });

  return query(component, invalidConfig, invalidState).map((valid: Result<any, string>) => {
    if (component.getSystem().isConnected()) {
      return valid.fold((err) => {
        markInvalid(component, invalidConfig, invalidState, err);
        return Result.error(err);
      }, (v) => {
        markValid(component, invalidConfig);
        return Result.value(v);
      });
    } else {
      return Result.error('No longer in system');
    }
  });
};

const isInvalid = (component: AlloyComponent, invalidConfig: InvalidatingConfig): boolean => {
  const elem = invalidConfig.getRoot(component).getOr(component.element);
  return Class.has(elem, invalidConfig.invalidClass);
};

export {
  markValid,
  markInvalid,
  query,
  run,
  isInvalid
};
