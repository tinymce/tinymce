import Sizes from '../resize/Sizes';

var halve = function (main, other) {
  var width = Sizes.getGenericWidth(main);
  width.each(function (width) {
    var newWidth = width.width() / 2;
    Sizes.setGenericWidth(main, newWidth, width.unit());
    Sizes.setGenericWidth(other, newWidth, width.unit());
  });
};

export default {
  halve: halve
};