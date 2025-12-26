// src/test-db.js
const pool = require('./config/db');

async function testConnection() {
  try {
    // Cek dulu pool-nya apa
    console.log('Tipe pool:', typeof pool);
    console.log('Isi pool:', pool);

    const [rows] = await pool.query('SELECT 1 + 1 AS hasil');
    console.log('Koneksi berhasil. Hasil query:', rows[0].hasil);
  } catch (error) {
    console.error('Koneksi gagal:', error);
  }
}

testConnection();
