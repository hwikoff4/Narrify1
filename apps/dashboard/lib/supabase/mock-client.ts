// Mock Supabase client for demo mode
import {
  mockUser,
  mockClient,
  mockTours,
  mockApiKeys,
  mockAnalyticsEvents,
} from '../mock-data';

// In-memory storage for demo mode
let demoData = {
  client: { ...mockClient },
  tours: [...mockTours],
  apiKeys: [...mockApiKeys],
  analyticsEvents: [...mockAnalyticsEvents],
};

// Mock query builder
class MockQueryBuilder {
  private tableName: string;
  private filters: any[] = [];
  private selectFields: string = '*';
  private orderConfig: { column: string; ascending: boolean } | null = null;
  private limitValue: number | null = null;
  private singleMode: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  order(column: string, options: { ascending: boolean }) {
    this.orderConfig = { column, ...options };
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.singleMode = true;
    return this;
  }

  private applyFilters(items: any[]) {
    return items.filter((item) => {
      return this.filters.every((filter) => {
        const value = item[filter.column];
        if (filter.operator === 'eq') {
          return value === filter.value;
        }
        if (filter.operator === 'gte') {
          return new Date(value) >= new Date(filter.value);
        }
        return true;
      });
    });
  }

  private applyOrder(items: any[]) {
    if (!this.orderConfig) return items;

    return [...items].sort((a, b) => {
      const aVal = a[this.orderConfig!.column];
      const bVal = b[this.orderConfig!.column];

      if (this.orderConfig!.ascending) {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  async then(resolve: any) {
    let data: any[];

    switch (this.tableName) {
      case 'clients':
        data = [demoData.client];
        break;
      case 'tours':
        data = demoData.tours;
        break;
      case 'api_keys':
        data = demoData.apiKeys;
        break;
      case 'analytics_events':
        data = demoData.analyticsEvents;
        break;
      default:
        data = [];
    }

    // Apply filters
    data = this.applyFilters(data);

    // Apply ordering
    data = this.applyOrder(data);

    // Apply limit
    if (this.limitValue) {
      data = data.slice(0, this.limitValue);
    }

    // Return single or array
    if (this.singleMode) {
      resolve({ data: data[0] || null, error: null });
    } else {
      resolve({ data, error: null });
    }
  }
}

// Mock insert/update/delete operations
class MockMutationBuilder {
  private tableName: string;
  private filters: any[] = [];
  private updateData: any = null;
  private insertData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  insert(data: any) {
    this.insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  delete() {
    return this;
  }

  async then(resolve: any) {
    if (this.insertData) {
      // Handle insert
      const newItems = this.insertData.map((item: any) => ({
        id: `${this.tableName}-${Date.now()}-${Math.random()}`,
        created_at: new Date().toISOString(),
        ...item,
      }));

      switch (this.tableName) {
        case 'tours':
          demoData.tours = [...demoData.tours, ...newItems];
          break;
        case 'api_keys':
          demoData.apiKeys = [...demoData.apiKeys, ...newItems];
          break;
        case 'clients':
          demoData.client = { ...demoData.client, ...newItems[0] };
          break;
      }

      resolve({ data: newItems, error: null });
    } else if (this.updateData) {
      // Handle update
      const filter = this.filters[0];
      let updated = false;

      switch (this.tableName) {
        case 'clients':
          if (filter && (demoData.client as any)[filter.column] === filter.value) {
            demoData.client = { ...demoData.client, ...this.updateData };
            updated = true;
          }
          break;
        case 'tours':
          demoData.tours = demoData.tours.map((tour: any) =>
            filter && tour[filter.column] === filter.value
              ? { ...tour, ...this.updateData }
              : tour
          );
          updated = true;
          break;
        case 'api_keys':
          demoData.apiKeys = demoData.apiKeys.map((key: any) =>
            filter && key[filter.column] === filter.value
              ? { ...key, ...this.updateData }
              : key
          );
          updated = true;
          break;
      }

      resolve({ data: updated ? this.updateData : null, error: null });
    } else {
      // Handle delete
      const filter = this.filters[0];

      switch (this.tableName) {
        case 'tours':
          demoData.tours = demoData.tours.filter(
            (tour: any) => !filter || tour[filter.column] !== filter.value
          );
          break;
        case 'api_keys':
          demoData.apiKeys = demoData.apiKeys.filter(
            (key: any) => !filter || key[filter.column] !== filter.value
          );
          break;
      }

      resolve({ data: null, error: null });
    }
  }
}

// Mock Supabase client
export function createMockClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: mockUser },
        error: null,
      }),
      getSession: async () => ({
        data: {
          session: {
            access_token: 'demo-token',
            refresh_token: 'demo-refresh-token',
            user: mockUser,
          },
        },
        error: null,
      }),
      signInWithPassword: async ({ email, password }: any) => ({
        data: { user: mockUser, session: { access_token: 'demo-token' } },
        error: null,
      }),
      signUp: async ({ email, password }: any) => ({
        data: { user: mockUser, session: { access_token: 'demo-token' } },
        error: null,
      }),
      signOut: async () => ({
        error: null,
      }),
      resetPasswordForEmail: async (email: string) => ({
        data: {},
        error: null,
      }),
    },
    from: (tableName: string) => {
      const builder: any = new MockQueryBuilder(tableName);
      const mutationBuilder = new MockMutationBuilder(tableName);

      // Add mutation methods
      builder.insert = mutationBuilder.insert.bind(mutationBuilder);
      builder.update = mutationBuilder.update.bind(mutationBuilder);
      builder.delete = mutationBuilder.delete.bind(mutationBuilder);

      return builder;
    },
  };
}
