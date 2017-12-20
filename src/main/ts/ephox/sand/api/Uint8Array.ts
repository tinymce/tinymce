import Global from '../util/Global';



export default <any> function (arr) {
  var f = Global.getOrDie('Uint8Array');
  return new f(arr);
};