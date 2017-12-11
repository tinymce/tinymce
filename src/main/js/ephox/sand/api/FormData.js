import Global from '../util/Global';



export default <any> function () {
  var f = Global.getOrDie('FormData');
  return new f();
};