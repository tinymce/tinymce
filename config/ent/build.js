var p = Ent.Project.create('phoenix', 'js');
p.setVersion(2, 2, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

