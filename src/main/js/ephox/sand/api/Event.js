import Global from '../util/Global';



export default <any> function (name) {
  var f = Global.getOrDie('Event');
  return new f(name);
};