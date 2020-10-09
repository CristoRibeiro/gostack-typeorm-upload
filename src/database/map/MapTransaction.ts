import Transaction from '../../models/Transaction';

class MapTransaction {
  static toDTO(transaction: Transaction): any {
    return {
      id: transaction.id,
      title: transaction.title,
      value: transaction.value,
      type: transaction.type,
      category: transaction.category,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }
}
export default MapTransaction;
