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
    name: 'mcagar',
    repository: 'buildrepo2',
    source: 'mcagar.zip',
    targets: [
      { name: 'module/*.js', path: test },
      { name: 'depend/*.js', path: test }
    ]
  }
];
