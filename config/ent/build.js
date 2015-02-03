var p = Ent.Project.create('echo', 'js');
p.setVersion(1, 0, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

