var p = Ent.Project.create('phoenix', 'js');
p.setVersion(3, 2, 2);
p.setBolt('library', '**/*.js');
p.setBoltTest();

