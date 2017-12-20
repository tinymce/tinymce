import Global from '../util/Global';



export default <any> function (parts, properties) {
  var f = Global.getOrDie('Blob');
  return new f(parts, properties);
};