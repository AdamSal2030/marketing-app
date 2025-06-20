import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export default async function handler(req, res) {
  try {
    const filePath = path.resolve(process.cwd(), 'data', 'data1.csv');
    
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data, errors } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length) {
      console.error('CSV parsing errors:', errors);
      return res.status(400).json({ error: 'CSV parsing error', details: errors });
    }

    const transformed = data.map(item => ({
      name: item['Program Name'] || '',
      Affiliate: item.Affiliate || '',
      State: item.State || '',
      call: item.Calls,
      market: item.Market || '',
      location: item.Location || '',
      time: item.Time || '',
      price: item.Rate ? Number(item.Rate.replace(/\$/g, '').replace(/,/g, '')) : 0
    }));

    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error reading or parsing CSV file:', error);
    res.status(500).json({ error: 'Failed to read and process CSV file' });
  }
}
