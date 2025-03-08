import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

// MongoDB Atlas connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_atlas_connection_string';

// Connect to MongoDB Atlas
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

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
  phone?: string;
  website?: string;
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
  phone: {
    type: String,
    required: false,
  },
  website: {
    type: String,
    required: false,
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
