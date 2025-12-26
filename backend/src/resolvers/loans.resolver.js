const { inventoryPool, authPool } = require('../config/database');

// Helper function to format loan dates
const formatLoanDates = (loan) => {
  if (!loan) return null;
  
  const formatDate = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue === 'string') return dateValue;
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    return null;
  };

  return {
    ...loan,
    loan_date: formatDate(loan.loan_date),
    planned_return_date: formatDate(loan.planned_return_date),
    actual_return_date: formatDate(loan.actual_return_date),
  };
};

const loansResolvers = {
  Query: {
    items: async () => {
      const result = await inventoryPool.query(
        'SELECT * FROM items WHERE is_deleted = FALSE ORDER BY created_at DESC'
      );
      return result.rows;
    },

    item: async (_, { id }) => {
      const result = await inventoryPool.query(
        'SELECT * FROM items WHERE id = $1',
        [id]
      );
      return result.rows[0];
    },

    availableItems: async () => {
      const result = await inventoryPool.query(
        'SELECT * FROM items WHERE available_quantity > 0 AND condition_status = $1 AND is_deleted = FALSE ORDER BY name',
        ['BAIK']
      );
      return result.rows;
    },

    myLoans: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      if (context.user.role === 'admin') {
        throw new Error('Admins do not have loans');
      }

      const result = await inventoryPool.query(
        'SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC',
        [context.user.userId]
      );

      return result.rows.map(formatLoanDates);
    },

    allLoans: async (_, __, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const result = await inventoryPool.query(
        'SELECT * FROM loans ORDER BY created_at DESC'
      );

      return result.rows.map(formatLoanDates);
    },

    pendingLoans: async (_, __, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const result = await inventoryPool.query(
        'SELECT * FROM loans WHERE status = $1 ORDER BY created_at ASC',
        ['pending']
      );

      return result.rows.map(formatLoanDates);
    },

    activeLoans: async (_, __, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const result = await inventoryPool.query(
        'SELECT * FROM loans WHERE status IN ($1, $2) ORDER BY created_at DESC',
        ['approved', 'active']
      );

      return result.rows.map(formatLoanDates);
    },

    loan: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const result = await inventoryPool.query(
        'SELECT * FROM loans WHERE id = $1',
        [id]
      );

      const loan = result.rows[0];

      if (!loan) {
        throw new Error('Loan not found');
      }

      if (context.user.role !== 'admin' && loan.user_id !== context.user.userId) {
        throw new Error('Access denied');
      }

      return formatLoanDates(loan);
    },
  },

  Mutation: {
    createItem: async (_, { input }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const {
        name,
        code,
        category,
        total_quantity,
        available_quantity,
        location,
        condition_status,
        description,
        image_url,
      } = input;

      const existingItem = await inventoryPool.query(
        'SELECT id FROM items WHERE code = $1',
        [code]
      );

      if (existingItem.rows.length > 0) {
        throw new Error('Item code already exists');
      }

      const result = await inventoryPool.query(
        `INSERT INTO items (name, code, category, total_quantity, available_quantity, location, condition_status, description, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          name,
          code,
          category,
          total_quantity,
          available_quantity,
          location,
          condition_status || 'BAIK',
          description,
          image_url,
        ]
      );

      return result.rows[0];
    },

    updateItem: async (_, { id, input }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const existing = await inventoryPool.query(
        'SELECT * FROM items WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        throw new Error('Item not found');
      }

      const item = existing.rows[0];
      const {
        name,
        code,
        category,
        total_quantity,
        available_quantity,
        location,
        condition_status,
        description,
        image_url,
      } = input;

      const result = await inventoryPool.query(
        `UPDATE items SET
          name = $1, code = $2, category = $3, total_quantity = $4,
          available_quantity = $5, location = $6, condition_status = $7,
          description = $8, image_url = $9
         WHERE id = $10 RETURNING *`,
        [
          name ?? item.name,
          code ?? item.code,
          category ?? item.category,
          total_quantity ?? item.total_quantity,
          available_quantity ?? item.available_quantity,
          location ?? item.location,
          condition_status ?? item.condition_status,
          description ?? item.description,
          image_url ?? item.image_url,
          id,
        ]
      );

      return result.rows[0];
    },

    deleteItem: async (_, { id }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Soft delete - set is_deleted to true instead of deleting
      const result = await inventoryPool.query(
        'UPDATE items SET is_deleted = TRUE WHERE id = $1',
        [id]
      );

      return result.rowCount > 0;
    },

    requestLoan: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      if (context.user.role === 'admin') {
        throw new Error('Admins cannot request loans');
      }

      const { item_id, loan_date, planned_return_date, notes } = input;

      const item = await inventoryPool.query(
        'SELECT * FROM items WHERE id = $1',
        [item_id]
      );

      if (item.rows.length === 0) {
        throw new Error('Item not found');
      }

      if (item.rows[0].available_quantity <= 0) {
        throw new Error('Item not available');
      }

      const result = await inventoryPool.query(
        `INSERT INTO loans (item_id, user_id, loan_date, planned_return_date, status, notes)
         VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`,
        [item_id, context.user.userId, loan_date, planned_return_date, notes]
      );

      return formatLoanDates(result.rows[0]);
    },

    approveLoan: async (_, { input }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const { loan_id, admin_notes } = input;

      const loan = await inventoryPool.query(
        'SELECT * FROM loans WHERE id = $1',
        [loan_id]
      );

      if (loan.rows.length === 0) {
        throw new Error('Loan not found');
      }

      if (loan.rows[0].status !== 'pending') {
        throw new Error('Loan is not pending');
      }

      const item = await inventoryPool.query(
        'SELECT available_quantity FROM items WHERE id = $1',
        [loan.rows[0].item_id]
      );

      if (item.rows[0].available_quantity <= 0) {
        throw new Error('Item no longer available');
      }

      await inventoryPool.query(
        'UPDATE items SET available_quantity = available_quantity - 1 WHERE id = $1',
        [loan.rows[0].item_id]
      );

      const result = await inventoryPool.query(
        `UPDATE loans SET 
          status = 'approved', 
          admin_notes = $1, 
          approved_by = $2, 
          approved_at = NOW()
         WHERE id = $3 RETURNING *`,
        [admin_notes, context.user.userId, loan_id]
      );

      return formatLoanDates(result.rows[0]);
    },

    rejectLoan: async (_, { input }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const { loan_id, admin_notes } = input;

      const loan = await inventoryPool.query(
        'SELECT * FROM loans WHERE id = $1',
        [loan_id]
      );

      if (loan.rows.length === 0) {
        throw new Error('Loan not found');
      }

      if (loan.rows[0].status !== 'pending') {
        throw new Error('Loan is not pending');
      }

      const result = await inventoryPool.query(
        `UPDATE loans SET 
          status = 'rejected', 
          admin_notes = $1
         WHERE id = $2 RETURNING *`,
        [admin_notes, loan_id]
      );

      return formatLoanDates(result.rows[0]);
    },

    markAsReturned: async (_, { input }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const { loan_id, actual_return_date, admin_notes } = input;

      const loan = await inventoryPool.query(
        'SELECT * FROM loans WHERE id = $1',
        [loan_id]
      );

      if (loan.rows.length === 0) {
        throw new Error('Loan not found');
      }

      if (loan.rows[0].status === 'returned') {
        throw new Error('Item already returned');
      }

      if (loan.rows[0].status === 'approved' || loan.rows[0].status === 'active') {
        await inventoryPool.query(
          'UPDATE items SET available_quantity = available_quantity + 1 WHERE id = $1',
          [loan.rows[0].item_id]
        );
      }

      const result = await inventoryPool.query(
        `UPDATE loans SET 
          status = 'returned', 
          actual_return_date = $1,
          admin_notes = $2
         WHERE id = $3 RETURNING *`,
        [actual_return_date, admin_notes, loan_id]
      );

      return formatLoanDates(result.rows[0]);
    },
  },

  Loan: {
    item: async (parent) => {
      const result = await inventoryPool.query(
        'SELECT * FROM items WHERE id = $1',
        [parent.item_id]
      );
      return result.rows[0];
    },

    user: async (parent) => {
      const result = await authPool.query(
        'SELECT id, email, role, name, nim, phone, organization, is_active, created_at FROM users WHERE id = $1',
        [parent.user_id]
      );
      return result.rows[0];
    },
  },
};

module.exports = loansResolvers;
