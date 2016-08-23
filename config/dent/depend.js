var lib = 'lib';
var run = lib + '/run';
var depend = run + '/depend';
var licenses = run + '/licenses';
var demo = lib + '/demo';
var test = lib + '/test';
var config = lib + '/config';

var cleanDirs = [ lib ];

var dependencies = [
  {
    name: 'wrap-jsverify',
    repository: 'buildrepo2',
    version: '1.0 latest',
    source: 'wrap-jsverify.zip',
    targets: [
      { name: 'compile/ephox.wrap.Jsc.js', path: test }
    ]
  }
];

