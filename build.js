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

// Copy index.html, doctor.html and admin.html
fs.copyFileSync('index.html', 'www/index.html');
if (fs.existsSync('doctor.html')) {
    fs.copyFileSync('doctor.html', 'www/doctor.html');
}
if (fs.existsSync('admin.html')) {
    fs.copyFileSync('admin.html', 'www/admin.html');
}
if (fs.existsSync('reception.html')) {
    fs.copyFileSync('reception.html', 'www/reception.html');
}
if (fs.existsSync('preview.html')) {
    fs.copyFileSync('preview.html', 'www/preview.html');
}
if (fs.existsSync('landing.html')) {
    fs.copyFileSync('landing.html', 'www/landing.html');
}
if (fs.existsSync('chirag.jpeg')) {
    fs.copyFileSync('chirag.jpeg', 'www/chirag.jpeg');
}
if (fs.existsSync('logo.jpg')) {
    fs.copyFileSync('logo.jpg', 'www/logo.jpg');
}

// Copy css and js folders
if (fs.existsSync('css')) copyFolderSync('css', 'www/css');
if (fs.existsSync('js')) copyFolderSync('js', 'www/js');

console.log('Build completed: Web assets copied to www/');
