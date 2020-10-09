import { EntityRepository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoryRepository {}

export default CategoryRepository;
