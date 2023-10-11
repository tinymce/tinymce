const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const modules = process.argv[2];
const command = process.argv.slice(3).join(' ');
const changieConfigSrc = './.changie.yaml';

if (!modules || !command) {
    console.error('Module and command are required.');
    process.exit(1);
}

function executeChangie(modulePath, command) {
    try {
        const changieConfigDest = path.join(modulePath, '.changie.yaml');

        fs.copyFileSync(changieConfigSrc, changieConfigDest);
        execSync(`cd ${modulePath} && changie ${command}`, { stdio: 'inherit' });
        fs.unlinkSync(changieConfigDest);
    } catch (error) {
        console.error(`Error executing changie ${command} in ${modulePath}:`, error);
    }
}

if (modules === 'all') {
    // Run the command for all folders in the modules directory
    const modulesDir = 'modules';
    const folders = fs.readdirSync(modulesDir)
        .filter(dir => fs.statSync(path.join(modulesDir, dir)).isDirectory())
        .filter(dir => !dir.startsWith('oxide'));
    
    folders.forEach(folder => {
        const modulePath = path.join(modulesDir, folder);

        executeChangie(path.join(modulesDir, folder), command);
    });
} else {
    executeChangie(`./modules/${modules}`, command);
}
