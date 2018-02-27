import * as DomModification from '../../dom/DomModification';

const exhibit = function (base, posConfig/*, posState */) {
  return DomModification.nu({
    classes: [ ],
    styles: posConfig.useFixed() ? { } : { position: 'relative' }
  });
};

export {
  exhibit
};