import DomModification from '../../dom/DomModification';

var exhibit = function (base, posConfig/*, posState */) {
  return DomModification.nu({
    classes: [ ],
    styles: posConfig.useFixed() ? { } : { position: 'relative' }
  });
};

export default <any> {
  exhibit: exhibit
};