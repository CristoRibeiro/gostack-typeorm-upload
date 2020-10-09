import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

class CreateTransactionService {
  public async execute(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const existingCategory = await categoryRepository.findOne({
      title,
    });
    if (existingCategory) {
      throw new AppError('Category already exists!');
    }
    const category = categoryRepository.create({
      title,
    });

    await categoryRepository.save(category);

    return category;
  }
}

export default CreateTransactionService;
