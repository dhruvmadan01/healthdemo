const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
        } else {
            fs.copyFileSync(fromPath, toPath);
        }
    });
}

// Clean or create www
if (fs.existsSync('www')) {
    fs.rmSync('www', { recursive: true, force: true });
}
fs.mkdirSync('www');

// Copy index.html
fs.copyFileSync('index.html', 'www/index.html');

// Copy css and js folders
if (fs.existsSync('css')) copyFolderSync('css', 'www/css');
if (fs.existsSync('js')) copyFolderSync('js', 'www/js');

console.log('Build completed: Web assets copied to www/');
