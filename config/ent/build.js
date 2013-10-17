var p = Ent.Project.create('phoenix', 'js');
p.setVersion(2, 1, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

