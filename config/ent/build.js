var p = Ent.Project.create('robin', 'js');
p.setVersion(3, 3, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

