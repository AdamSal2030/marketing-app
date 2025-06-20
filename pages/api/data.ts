import fs from 'fs';
import path from 'path';


function roundToNearest50or100(num) {
  const remainder = num % 100;
  if (remainder < 25) {
    return Math.floor(num / 100) * 100;
  } else if (remainder < 75) {
    return Math.floor(num / 100) * 100 + 50;
  } else {
    return Math.ceil(num / 100) * 100;
  }
}

export default async function handler(req, res) {
  try {
    const filePath = path.resolve('data', 'data.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(fileContent);

    if (!Array.isArray(json.result)) {
      return res.status(400).json({ error: "Invalid data format: 'results' not found." });
    }

    const transformed = json.result.map((item) => {
      const rawPrice = item.defaultPrice?.[0];
      const priceNum = parseFloat(rawPrice);

      let finalPrice = '';
      if (!isNaN(priceNum)) {
        finalPrice = priceNum <= 500
          ? priceNum + 150
          : priceNum + priceNum * 0.35;

        finalPrice = roundToNearest50or100(finalPrice);
      }

      return {
        name:            item.name || '',
        price:           finalPrice !== '' ? finalPrice : '',
        do_follow:       item.do_follow ?? '',
        estimated_time:  item.estimated_time ?? '',
        genres:          item.genres?.map(g => g.name).join(', ') ?? '',
        regions:         item.regions?.map(r => r.name).join(', ') ?? '',
        url:             item.url || '',
        example:         item.articlePreview?.asset?._ref || '',
        logo:            item.logo?.asset?._ref || ''
      };
    });

    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    res.status(500).json({ error: 'Failed to read and process JSON file' });
  }
}
