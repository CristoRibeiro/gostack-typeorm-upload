import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import ImporFileCsv from '../config/ImportFileCsv';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const registrosCsv = await ImporFileCsv.getRegistrosCsv(filename, false);

    const transactionsCsv: CsvTransaction[] = [];

    registrosCsv.forEach(element => {
      const [title, type, value, category] = element;

      if (!title || !type || !value) return;

      transactionsCsv.push({
        title,
        type: type as 'income' | 'outcome',
        value: Number(value),
        category,
      });
    });

    const categoriesCsv = transactionsCsv.map(elemento => elemento.category);

    const repositoryCategory = getRepository(Category);

    const existingCategories = await repositoryCategory.find({
      where: { title: In(categoriesCsv) },
    });

    const nonExistentCategories = categoriesCsv
      .filter(
        element =>
          !existingCategories.map(category => category.title).includes(element),
      )
      .filter((element, index, self) => self.indexOf(element) === index);

    const newCategories = repositoryCategory.create(
      nonExistentCategories.map(element => ({
        title: element,
      })),
    );
    await repositoryCategory.save(newCategories);

    const totalCategories = [...newCategories, ...existingCategories];

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = transactionsRepository.create(
      transactionsCsv.map(element => ({
        title: element.title,
        value: element.value,
        type: element.type,
        category: totalCategories.find(
          category => category.title === element.category,
        ),
      })),
    );

    await transactionsRepository.save(transactions);
    return transactions;
  }
}

export default ImportTransactionsService;
