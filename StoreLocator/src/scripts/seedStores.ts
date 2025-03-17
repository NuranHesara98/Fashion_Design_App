import { connectDB, disconnectDB } from '../config/db';
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
  },
  {
    name: 'Imtiaz Designers',
    address: '38 S. De. S Jayasinghe Rd, 10350',
    phone: '0711118888',
    website: 'https://www.imtiazdesigners.lk/',
    openingHours: {
      monday: '10 AM–7:30 PM',
      tuesday: '10 AM–7:30 PM',
      wednesday: '10 AM–7:30 PM',
      thursday: '10 AM–7:30 PM',
      friday: '10 AM–7:30 PM',
      saturday: '10 AM–7:30 PM',
      sunday: '10:30 AM–3:30 PM'
    }
  },
  {
    name: 'Hercules Tailors',
    address: 'NO 30,1ST FLOOR, Dickmans Rd, Colombo 00500',
    phone: '0112586287',
    website: 'http://www.herculestailors.lk/',
    openingHours: {
      monday: '9:30 AM–6:30 PM',
      tuesday: '9:30 AM–6:30 PM',
      wednesday: '9:30 AM–6:30 PM',
      thursday: '9:30 AM–6:30 PM',
      friday: '9:30 AM–6:30 PM',
      saturday: '9:30 AM–6 PM',
      sunday: 'Closed'
    }
  },
  {
    name: 'Rayman Custom Tailors (Pvt) Ltd',
    address: 'VV9R+9G6, 184 High Level Rd, Nugegoda 10250',
    phone: '0112820271',
    website: 'http://www.raymancustomtailor.com/',
    openingHours: {
      monday: '9 AM–8 PM',
      tuesday: '9 AM–8 PM',
      wednesday: '9 AM–8 PM',
      thursday: '9 AM–8 PM',
      friday: '9 AM–8 PM',
      saturday: '9 AM–8 PM',
      sunday: '9 AM–2 PM'
    }
  }
];

async function seedStores() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();

    // Clear existing stores
    console.log('Clearing existing stores...');
    await StoreModel.deleteMany({});
    console.log('Existing stores cleared');

    // Insert new stores
    console.log('Inserting new stores...');
    const stores = await StoreModel.insertMany(storeData);
    console.log(`Successfully inserted ${stores.length} stores`);

    // Disconnect from MongoDB
    await disconnectDB();
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stores:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedStores();
