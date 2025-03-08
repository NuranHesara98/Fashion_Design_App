import { connectDB } from '../config/db';
import { StoreModel, IStore } from '../models/Store';

const storeData: IStore[] = [
  {
    name: 'House of Tailors',
    address: '195 High Level Rd, Nugegoda 10250',
    phone: '0741858790',
    website: 'http://cibweb.lk/',
    openingHours: {
      monday: '9 AM–7 PM',
      tuesday: '9 AM–7 PM',
      wednesday: '9 AM–7 PM',
      thursday: '9 AM–7 PM',
      friday: '9 AM–7 PM',
      saturday: '9 AM–7 PM',
      sunday: '9 AM–7 PM'
    }
  },
  {
    name: 'Smart Tailors',
    address: '139a Sri Saranankara Rd, Dehiwala-Mount Lavinia',
    openingHours: {
      monday: '10:30 AM–7:30 PM',
      tuesday: '10:30 AM–7:30 PM',
      wednesday: '10:30 AM–7:30 PM',
      thursday: '10:30 AM–7:30 PM',
      friday: '10:30 AM–7:30 PM',
      saturday: '10:30 AM–7:30 PM',
      sunday: 'Closed'
    }
  },
  {
    name: 'Maas Luxury | Maas Designs',
    address: '17 Thimbirigasyaya Rd, Colombo 00500',
    phone: '0776637777',
    openingHours: {
      monday: '9:30 AM–7 PM',
      tuesday: '9:30 AM–7 PM',
      wednesday: '9:30 AM–7 PM',
      thursday: '9:30 AM–7 PM',
      friday: '9:30 AM–7 PM',
      saturday: '9:30 AM–7 PM',
      sunday: '9:30 AM–2 PM'
    }
  }
];

const seedStores = async () => {
  try {
    await connectDB();
    
    // Clear existing stores
    await StoreModel.deleteMany({});
    
    // Insert all stores
    const stores = await StoreModel.insertMany(storeData);
    console.log('Stores seeded successfully:', stores);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stores:', error);
    process.exit(1);
  }
};

seedStores();
