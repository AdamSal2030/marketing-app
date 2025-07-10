import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the shape of your CSV data
interface CSVRow {
  'Program Name'?: string;
  'Affiliate'?: string;
  'State'?: string;
  'Calls'?: string;
  'Market'?: string;
  'Location'?: string;
  'Time'?: string;
  'Rate'?: string;
}

// Define the transformed output shape
interface TransformedRow {
  name: string;
  Affiliate: string;
  State: string;
  call: string;
  market: string;
  location: string;
  time: string;
  price: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransformedRow[] | { error: string; details?: unknown }>
) {
  try {
    const filePath = path.resolve(process.cwd(), 'data', 'data1.csv');
    
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data, errors } = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length) {
      console.error('CSV parsing errors:', errors);
      return res.status(400).json({ error: 'CSV parsing error', details: errors });
    }

    const transformed: TransformedRow[] = data.map((item: CSVRow) => ({
      name: item['Program Name'] || '',
      Affiliate: item.Affiliate || '',
      State: item.State || '',
      call: item.Calls || '',
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