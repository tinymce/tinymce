var p = Ent.Project.create('echo', 'js');
p.setVersion(1, 1, 2);
p.setBolt('library', '**/*.js');
p.setBoltTest();

