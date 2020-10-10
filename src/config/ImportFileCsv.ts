import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

export default class ImporFileCsv {
  public static async getRegistrosCsv(
    patchFile: string,
    isReadHeader: boolean,
  ): Promise<Array<Array<string>>> {
    const csvFilePath = path.resolve(patchFile);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: isReadHeader ? 1 : 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Array<Array<string>> = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    fs.unlink(patchFile, err => {
      if (err) throw err;
    });
    return lines;
  }
}
