var p = Ent.Project.create('robin', 'js');
p.setVersion(4, 0, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

