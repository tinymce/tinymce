import Global from '../util/Global';



export default <any> function () {
  var f = Global.getOrDie('FileReader');
  return new f();
};