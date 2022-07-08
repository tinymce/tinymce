import { Fun } from '@ephox/katamari';

const annotation = Fun.constant('mce-annotation');

const dataAnnotation = Fun.constant('data-mce-annotation');
const dataAnnotationId = Fun.constant('data-mce-annotation-uid');
const dataAnnotationActive = Fun.constant('data-mce-annotation-active');
const dataAnnotationClasses = Fun.constant('data-mce-annotation-classes');
const dataAnnotationAttributes = Fun.constant('data-mce-annotation-attrs');

export {
  annotation,
  dataAnnotation,
  dataAnnotationId,
  dataAnnotationActive,
  dataAnnotationClasses,
  dataAnnotationAttributes
};
