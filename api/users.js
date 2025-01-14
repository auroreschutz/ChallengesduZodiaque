import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const dataFilePath = resolve('./data.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    const data = readFileSync(dataFilePath, 'utf-8');
    res.status(200).json(JSON.parse(data));
  } else if (req.method === 'POST') {
    const newData = req.body;
    const data = JSON.parse(readFileSync(dataFilePath, 'utf-8'));
    data.push(newData);
    writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.status(201).json(newData);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}