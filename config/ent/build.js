var p = Ent.Project.create('robin', 'js');
p.setVersion(5, 0, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

