var p = Ent.Project.create('echo', 'js');
p.setVersion(1, 1, 1);
p.setBolt('library', '**/*.js');
p.setBoltTest();

