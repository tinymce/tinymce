var p = Ent.Project.create('robin', 'js');
p.setVersion(4, 1, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

