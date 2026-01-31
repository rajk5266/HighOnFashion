import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import formidable from 'formidable';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

export function getCollections() {
  const file = path.join(DATA_DIR, 'collections.json');
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(file));
}

export function saveCollections(collections) {
  fs.writeFileSync(path.join(DATA_DIR, 'collections.json'), JSON.stringify(collections, null, 2));
}

export function getProducts() {
  const file = path.join(DATA_DIR, 'products.json');
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(file));
}

export function saveProducts(products) {
  fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
}

export function uploadImage(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, uploadDir: IMAGES_DIR, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const file = files.image;
      if (!file) return reject('No file uploaded');
      const fileName = path.basename(file.filepath);
      resolve({ fields, filePath: `/images/products/${fileName}` });
    });
  });
}
