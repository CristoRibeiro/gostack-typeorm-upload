import patch from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const csvFilePath = patch.resolve(filename);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const transactionsCsv: CsvTransaction[] = [];
    const categoriesCsv: string[] = [];

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;

      transactionsCsv.push({ title, type, value, category });
      categoriesCsv.push(category);
    });
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    const repositoryCategory = getRepository(Category);

    const existentsCategories = await repositoryCategory.find({
      where: { title: In(categoriesCsv) },
    });

    const categoriesNotExists = categoriesCsv
      .filter(
        element =>
          !existentsCategories.map(exCat => exCat.title).includes(element),
      )
      .filter((element, index, self) => self.indexOf(element) === index);

    const newCategories = repositoryCategory.create(
      categoriesNotExists.map(element => ({
        title: element,
      })),
    );
    await repositoryCategory.save(newCategories);

    const categoriesTotal = [...newCategories, ...existentsCategories];

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = transactionsRepository.create(
      transactionsCsv.map(element => ({
        title: element.title,
        value: element.value,
        type: element.type,
        category: categoriesTotal.find(
          category => category.title === element.category,
        ),
      })),
    );

    await transactionsRepository.save(transactions);

    fs.unlink(filename, err => {
      if (err) throw err;
    });
    return transactions;
  }
}

export default ImportTransactionsService;
