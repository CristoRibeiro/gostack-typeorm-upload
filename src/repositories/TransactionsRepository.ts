import { EntityRepository, Repository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    if (!transactions) {
      throw new AppError('Not itens to list!');
    }
    const balance = transactions.reduce(
      (accumulator: Balance, currentValue: Transaction) => {
        switch (currentValue.type) {
          case 'income':
            accumulator.income += Number(currentValue.value);
            accumulator.total += Number(currentValue.value);
            break;
          case 'outcome':
            accumulator.outcome += Number(currentValue.value);
            accumulator.total -= Number(currentValue.value);
            break;
          default:
            break;
        }
        return accumulator;
      },
      { income: 0, outcome: 0, total: 0 },
    );
    return balance;
  }
}

export default TransactionsRepository;
