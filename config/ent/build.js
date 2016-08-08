var p = Ent.Project.create('alloy', 'js');
p.setVersion(1, 0, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

