import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import CreateCategoryService from './CreateCategoryService';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    let existingCategory = await categoryRepository.findOne({
      title: category,
    });
    if (!existingCategory) {
      existingCategory = await new CreateCategoryService().execute(category);
    }
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Type is invalid!');
    }
    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total - value < 0) {
        throw new AppError('Founds insufficient');
      }
    }

    const transaction = transactionsRepository.create({
      category: existingCategory,
      title,
      value,
      type,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
