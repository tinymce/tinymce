var p = Ent.Project.create('phoenix', 'js');
p.setVersion(1, 0, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

