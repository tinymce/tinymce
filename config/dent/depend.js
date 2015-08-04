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
    name: 'flour',
    repository: 'buildrepo2',
    source: 'flour.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'sugar',
    repository: 'buildrepo2',
    source: 'sugar.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'epithet',
    repository: 'buildrepo2',
    source: 'epithet.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'classify',
    repository: 'buildrepo2',
    source: 'classify.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'fred',
    repository: 'buildrepo2',
    source: 'fred.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  }

];

