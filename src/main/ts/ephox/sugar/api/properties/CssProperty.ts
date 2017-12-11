import Css from './Css';



export default <any> function (property, value) {
  var is = function (element) {
    return Css.get(element, property) === value;
  };

  var remove = function (element) {
    Css.remove(element, property);
  };

  var set = function (element) {
    Css.set(element, property, value);
  };

  return {
    is: is,
    remove: remove,
    set: set
  };
};