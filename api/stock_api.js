import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Lokasi file stok
  const filePath = path.join(process.cwd(), 'stock_data.json');

  // GET: Baca stok
  if (req.method === 'GET') {
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        return res.status(200).json(data);
      } catch (e) {
        return res.status(200).json([]);
      }
    } else {
      return res.status(200).json([]);
    }
  }

  // POST: Simpan stok baru
  if (req.method === 'POST') {
    const input = req.body;
    if (input && (Array.isArray(input) || typeof input === 'object')) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(input, null, 2));
        return res.status(200).json({ status: 'success', message: 'Stok tersimpan di server' });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Gagal menulis file' });
      }
    } else {
      return res.status(400).json({ status: 'error', message: 'Data tidak valid' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}