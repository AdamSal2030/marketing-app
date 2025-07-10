import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the shape of your CSV data
interface CSVRow {
  'Call Sign'?: string;
  'Station'?: string;
  'Rate'?: string;
  'TAT'?: string;
  'Sponsored'?: string;
  'Indexed'?: string;
  'Segement Length'?: string;
  'Location'?: string;
  'Program Name'?: string;
  'Interview Type'?: string;
  'Example'?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.resolve(process.cwd(), 'data', 'data2.csv');
    
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data, errors } = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length) {
      console.error('CSV parsing errors:', errors);
      return res.status(400).json({ error: 'CSV parsing error', details: errors });
    }

    const transformed = data.map((item: CSVRow) => ({
        CallSign: item['Call Sign'] || '',
        station: item['Station'] || '',
        rate: item.Rate ? Number(item.Rate.replace(/\$/g, '').replace(/,/g, '')) : 0,
        tat: item.TAT || '',
        sponsored: item.Sponsored || '',
        indexed: item.Indexed || '',
        SegmentLength: item['Segement Length'] || '',
        location: item.Location || '',
        ProgramName: item['Program Name'] || '',
        InterviewType: item['Interview Type'] || '',
        Example: item.Example || '',
      }));

    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error reading or parsing CSV file:', error);
    res.status(500).json({ error: 'Failed to read and process CSV file' });
  }
}