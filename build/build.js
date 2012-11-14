var p = Ent.Project.create('porkbun', 'js');
p.setVersion(2, 0, 0);
p.setBolt('library', '**/*.js');
p.setBoltTest();
