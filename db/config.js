const fs = require('fs');

// Menyimpan variabel konfigurasi global
global.sessionName = 'izalsye-server';
global.linkwebhook = 'http://localhost/SholatBot-WhatsApp/';
global.database = 'wabot';
global.username = 'root';
global.password = '';
global.owner = ['6282229738027'] //Ganti
global.botName = 'Izalsye' //Ganti

// Simpan konfigurasi ke dalam file config.json
const config = {
  sessionName: global.sessionName,
  linkwebhook: global.linkwebhook,
  database: global.database,
  username: global.username,
  password: global.password,
};

fs.writeFileSync('./db/config.json', JSON.stringify(config, null, 2)); // Menyimpan ke file config.json
