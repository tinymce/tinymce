var p = Ent.Project.create('robin', 'js');
p.setVersion(4, 2, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

