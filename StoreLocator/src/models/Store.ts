import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface IStore {
  name: string;
  address: string;
  openingHours: OpeningHours;
}

// MongoDB Schema
const storeSchema = new mongoose.Schema<IStore>({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  openingHours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String,
  },
});

export const StoreModel = mongoose.model<IStore>('Store', storeSchema);

// JSON File operations
export class StoreService {
  private static readonly dataPath = path.join(__dirname, '../data/stores.json');

  static async getAllStores(): Promise<IStore[]> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const jsonData = JSON.parse(data);
      return jsonData.stores;
    } catch (error) {
      console.error('Error reading stores from JSON:', error);
      return [];
    }
  }

  static async addStore(store: IStore): Promise<boolean> {
    try {
      const stores = await this.getAllStores();
      stores.push(store);
      await fs.writeFile(this.dataPath, JSON.stringify({ stores }, null, 2));
      return true;
    } catch (error) {
      console.error('Error adding store to JSON:', error);
      return false;
    }
  }

  static async clearStores(): Promise<boolean> {
    try {
      await fs.writeFile(this.dataPath, JSON.stringify({ stores: [] }, null, 2));
      return true;
    } catch (error) {
      console.error('Error clearing stores from JSON:', error);
      return false;
    }
  }
}
