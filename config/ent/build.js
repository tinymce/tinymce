var p = Ent.Project.create('snooker', 'js');
p.setVersion(2, 2, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();

