// asynctest(
//   'browser.tinymce.plugins.visualchars.GetNodeListTest',
//   [
//     'ephox/tinymce',
//     'tinymce.plugins.visualchars.Plugin',
//     'ephox.agar.api.RawAssertions',
//     'ephox.agar.api.Pipeline'
//   ],
//   function (
//     tiny, Plugin, RawAssertions, Pipeline
//   ) {
//     var assertAllNodes = function (arr1, arr2) {
//       arr1.forEach(function (node, index) {
//         RawAssertions.assertEq('should be same', node.nodeValue, arr2[index].nodeValue);
//       });
//     };

//     var test1 = function () {
//       var regexp = Plugin.compileCharMapToRegExp(Plugin.charMap);
//       var p = document.createElement('p');
//       p.innerHTML = '<p>a&nbsp;&nbsp;&nbsp;&nbsp;b</p><p>a&nbsp;&nbsp;&nbsp;&nbsp;b</p>';
//       var txtNode = document.createTextNode('a    b');
//       var expected = [txtNode, txtNode];
//       var actual = Plugin.getNodeList(regexp, p);

//       assertAllNodes(expected, actual);
//     };

//     var test2 = function () {
//       var regexp = Plugin.compileCharMapToRegExp(Plugin.charMap);
//       var p = document.createElement('p');
//       p.innerHTML = '<p>a&nbsp;&nbsp;&nbsp;&nbsp;b</p>';
//       var txtNode = document.createTextNode('a    b');
//       var expected = [txtNode];
//       var actual = Plugin.getNodeList(regexp, p);

//       assertAllNodes(expected, actual);
//     };

//     test1();
//     test2();
//   }
// );
