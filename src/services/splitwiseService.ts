import { BaseErrorResponseDto } from '@/types/agent';

// Define interfaces for Splitwise API objects based on the OpenAPI spec
// This would be more robust in separate files (e.g., src/types/splitwise.ts)

interface SplitwiseUser {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  registration_status: 'confirmed' | 'dummy' | 'invited';
  picture: {
    small: string;
    medium: string;
    large: string;
  };
}

interface SplitwiseGroup {
  id: number;
  name: string;
  // ... other group properties
}

interface SplitwiseFriend {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
    registration_status: 'confirmed' | 'dummy' | 'invited';
    picture: {
        small: string;
        medium: string;
        large: string;
    };
    balance: {
        amount: string;
        currency_code: string;
    }[];
}

interface SplitwiseExpense {
    id: number;
    group_id: number | null;
    expense_bundle_id: number | null;
    description: string;
    repeats: boolean;
    repeat_interval: string | null;
    email_reminder: boolean;
    email_reminder_in_advance: number;
    next_repeat: string | null;
    details: string | null;
    comments_count: number;
    payment: boolean;
    creation_method: string;
    transaction_method: string;
    transaction_confirmed: boolean;
    transaction_id: string | null;
    transaction_status: string | null;
    cost: string;
    currency_code: string;
    repayments: {
        from: number;
        to: number;
        amount: string;
    }[];
    date: string;
    created_at: string;
    created_by: {
        id: number;
        first_name: string;
        last_name: string | null;
        picture: {
            medium: string;
        };
        custom_picture: boolean;
    };
    updated_at: string;
    updated_by: any;
    deleted_at: string | null;
    deleted_by: any;
    category: {
        id: number;
        name: string;
    };
    receipt: {
        large: string | null;
        original: string | null;
    };
    users: {
        user: {
            id: number;
            first_name: string;
            last_name: string | null;
            picture: {
                medium: string;
            };
        };
        user_id: number;
        paid_share: string;
        owed_share: string;
        net_balance: string;
    }[];
}

interface SplitwiseComment {
    id: number;
    content: string;
    // ... other comment properties
}

interface FilteredExpense {
    from: string;
    from_email: string | null;
    to: string;
    to_email: string | null;
    amount: string;
    date: string;
    settled: boolean;
    description: string;
    currency_code: string;
}

/**
 * Splitwise Service
 * Provides functionality to interact with the Splitwise API v3.0
 */
export class SplitwiseService {
  private readonly baseUrl = 'https://secure.splitwise.com/api/v3.0';

  private async request<T>(token: string, endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log(token)
    const headers = {
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
      'User-Agent': 'SplitwiseAPI/1.0',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(headers)

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Remove body for GET requests
    if (config.method === 'GET' || !config.method) {
      delete config.body;
    }

    try {
      const response = await fetch(url, config);
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new BaseErrorResponseDto(errorData.error || `Splitwise API error: ${response.status} ${response.statusText}`, response.status);
      }
      return await response.json();
    } catch (error: any) {
      if (error instanceof BaseErrorResponseDto) {
        throw error;
      }
      throw new BaseErrorResponseDto(`Failed to make Splitwise API request: ${error.message}`, 500);
    }
  }

  /**
   * Get information about the current user
   */
  async getCurrentUser(token: string): Promise<{ user: SplitwiseUser }> {
    return this.request<{ user: SplitwiseUser }>(token, 'get_current_user', {
      method: 'GET'
    });
  }

  /**
   * Get information about another user
   * @param id - User ID
   */
  async getUser(token: string, id: number): Promise<{ user: SplitwiseUser }> {
    return this.request<{ user: SplitwiseUser }>(token, `get_user/${id}`);
  }

  /**
   * List the current user's groups
   */
  async getGroups(token: string): Promise<{ groups: SplitwiseGroup[] }> {
    return this.request<{ groups: SplitwiseGroup[] }>(token, 'get_groups');
  }

  /**
   * Get information about a group
   * @param id - Group ID
   */
  async getGroup(token: string, id: number): Promise<{ group: SplitwiseGroup }> {
    return this.request<{ group: SplitwiseGroup }>(token, `get_group/${id}`);
  }

  /**
   * Create a group
   * @param groupData - Data for the new group
   */
  async createGroup(token: string, groupData: { name: string; group_type?: string; [key: string]: any }): Promise<{ group: SplitwiseGroup }> {
    return this.request<{ group: SplitwiseGroup }>(token, 'create_group', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  /**
   * Delete a group
   * @param id - Group ID
   */
  async deleteGroup(token: string, id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(token, `delete_group/${id}`, {
      method: 'POST',
    });
  }

  /**
   * List current user's friends
   */
  async getFriends(token: string): Promise<{ friends: SplitwiseFriend[] }> {
    return this.request<{ friends: SplitwiseFriend[] }>(token, 'get_friends');
  }

  /**
   * Get details about a friend
   * @param id - User ID of the friend
   */
  async getFriend(token: string, id: number): Promise<{ friend: SplitwiseFriend }> {
    return this.request<{ friend: SplitwiseFriend }>(token, `get_friend/${id}`);
  }

  /**
   * Add a friend
   * @param friendData - Data for the new friend
   */
  async createFriend(token: string, friendData: { user_email: string; user_first_name?: string; user_last_name?: string }): Promise<{ friend: SplitwiseFriend }> {
      return this.request<{ friend: SplitwiseFriend }>(token, 'create_friend', {
          method: 'POST',
          body: JSON.stringify(friendData),
      });
  }

  /**
   * Delete friendship
   * @param id - User ID of the friend
   */
  async deleteFriend(token: string, id: number): Promise<{ success: boolean }> {
      return this.request<{ success: boolean }>(token, `delete_friend/${id}`, {
          method: 'POST',
      });
  }

  /**
   * List the current user's expenses with filtered response
   */
  async getExpenses(token: string, params: { group_id?: number, friend_id?: number, limit?: number, offset?: number } = {}): Promise<{ expenses: FilteredExpense[] }> {
      const query = new URLSearchParams(params as any).toString();
      const response = await this.request<{ expenses: SplitwiseExpense[] }>(token, `get_expenses?${query}`);
      
      // Filter and transform the expenses
      const filteredExpenses: FilteredExpense[] = await Promise.all(response.expenses.map(async (expense) => {
          // Find the user who paid (positive net_balance)
          const paidUser = expense.users.find(user => parseFloat(user.net_balance) > 0);
          // Find the user who owes (negative net_balance)
          const owedUser = expense.users.find(user => parseFloat(user.net_balance) < 0);
          
          // Get full names
          const getFullName = (user: any) => {
              return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
          };
          
          const fromName = paidUser ? getFullName(paidUser.user) : 'Unknown';
          const toName = owedUser ? getFullName(owedUser.user) : 'Unknown';
          
          // Fetch email details for both users
          let fromEmail: string | null = null;
          let toEmail: string | null = null;
          
          try {
              if (paidUser) {
                  const paidUserDetails = await this.getUser(token, paidUser.user.id);
                  fromEmail = paidUserDetails.user.email;
              }
          } catch (error) {
              console.log(`Failed to fetch email for paid user ${paidUser?.user.id}:`, error);
          }
          
          try {
              if (owedUser) {
                  const owedUserDetails = await this.getUser(token, owedUser.user.id);
                  toEmail = owedUserDetails.user.email;
              }
          } catch (error) {
              console.log(`Failed to fetch email for owed user ${owedUser?.user.id}:`, error);
          }
          
          // Determine if settled (payment = true means it's a settlement)
          const settled = expense.payment;
          
          return {
              from: fromName,
              from_email: fromEmail,
              to: toName,
              to_email: toEmail,
              amount: expense.cost,
              date: expense.date,
              settled: settled,
              description: expense.description,
              currency_code: expense.currency_code
          };
      }));
      
      return { expenses: filteredExpenses };
  }

  /**
   * Get expense information
   * @param id - Expense ID
   */
  async getExpense(token: string, id: number): Promise<{ expense: SplitwiseExpense }> {
      return this.request<{ expense: SplitwiseExpense }>(token, `get_expense/${id}`);
  }

  /**
   * Create an expense
   * @param expenseData - Data for the new expense
   */
  async createExpense(token: string, expenseData: any): Promise<{ expenses: SplitwiseExpense[], errors: any }> {
      return this.request<{ expenses: SplitwiseExpense[], errors: any }>(token, 'create_expense', {
          method: 'POST',
          body: JSON.stringify(expenseData),
      });
  }

  /**
   * Get expense comments
   * @param expense_id - The ID of the expense
   */
  async getComments(token: string, expense_id: number): Promise<{ comments: SplitwiseComment[] }> {
      return this.request<{ comments: SplitwiseComment[] }>(token, `get_comments?expense_id=${expense_id}`);
  }
}
