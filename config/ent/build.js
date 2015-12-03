var p = Ent.Project.create('dragster', 'js');
p.setVersion(2, 0, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

