const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/worker-housing', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Helper functions
const generateInvoiceNumber = () => {
    return 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
};

const generateOrderNumber = () => {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
};

// Function to clean collections and drop indexes
const cleanDatabase = async () => {
    try {
        console.log('Cleaning database...');
        const db = mongoose.connection.db;

        // Get all collection names
        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`Cleaning collection: ${collectionName}`);

            // Drop the collection entirely (this removes data and indexes)
            await db.collection(collectionName).drop().catch(() => {
                // Ignore errors if collection doesn't exist
            });
        }

        console.log('Database cleaned successfully');
    } catch (error) {
        console.log('Database clean completed (some errors expected)');
    }
};

// Sample Data
const sampleUsers = [
    // 2 Admins
    { username: 'admin1', password: 'admin123', name: 'Admin One', type: 'admin', contactNumber: '1234567890', roomNumber: 'ADMIN', days: 365 },
    { username: 'admin2', password: 'admin123', name: 'Admin Two', type: 'admin', contactNumber: '1234567891', roomNumber: 'ADMIN', days: 365 },

    // 5 Residents
    { username: 'resident1', password: 'resident123', name: 'John Doe', type: 'resident', contactNumber: '1234567892', roomNumber: 'R101', days: 180 },
    { username: 'resident2', password: 'resident123', name: 'Jane Smith', type: 'resident', contactNumber: '1234567893', roomNumber: 'R102', days: 150 },
    { username: 'resident3', password: 'resident123', name: 'Mike Johnson', type: 'resident', contactNumber: '1234567894', roomNumber: 'R103', days: 200 },
    { username: 'resident4', password: 'resident123', name: 'Sarah Wilson', type: 'resident', contactNumber: '1234567895', roomNumber: 'R104', days: 120 },
    { username: 'resident5', password: 'resident123', name: 'David Brown', type: 'resident', contactNumber: '1234567896', roomNumber: 'R105', days: 90 },

    // 5 Workers
    { username: 'worker1', password: 'worker123', name: 'Alex Martinez', type: 'worker', contactNumber: '1234567897', roomNumber: 'W201', days: 300 },
    { username: 'worker2', password: 'worker123', name: 'Maria Garcia', type: 'worker', contactNumber: '1234567898', roomNumber: 'W202', days: 250 },
    { username: 'worker3', password: 'worker123', name: 'James Lee', type: 'worker', contactNumber: '1234567899', roomNumber: 'W203', days: 275 },
    { username: 'worker4', password: 'worker123', name: 'Lisa Chen', type: 'worker', contactNumber: '1234567800', roomNumber: 'W204', days: 220 },
    { username: 'worker5', password: 'worker123', name: 'Robert Kim', type: 'worker', contactNumber: '1234567801', roomNumber: 'W205', days: 180 }
];

const sampleGroceryItems = [
    { name: 'Rice', category: 'Grains', price: 2.50, unit: 'kg', description: 'Premium quality basmati rice', inStock: true },
    { name: 'Chicken Breast', category: 'Meat', price: 8.99, unit: 'kg', description: 'Fresh chicken breast', inStock: true },
    { name: 'Milk', category: 'Dairy', price: 3.25, unit: 'liter', description: 'Fresh whole milk', inStock: true },
    { name: 'Bread', category: 'Bakery', price: 2.00, unit: 'loaf', description: 'Whole wheat bread', inStock: true },
    { name: 'Eggs', category: 'Dairy', price: 4.50, unit: 'dozen', description: 'Farm fresh eggs', inStock: true },
    { name: 'Apples', category: 'Fruits', price: 3.75, unit: 'kg', description: 'Red delicious apples', inStock: true }
];

// Insert data using direct MongoDB operations
const insertUsers = async () => {
    console.log('Inserting users...');
    const db = mongoose.connection.db;

    const usersWithHashedPasswords = await Promise.all(
        sampleUsers.map(async (user) => ({
            ...user,
            password: await bcrypt.hash(user.password, 10),
            active: true,
            startDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        }))
    );

    await db.collection('users').insertMany(usersWithHashedPasswords);
    console.log('Users inserted successfully');
};

const insertGroceryItems = async () => {
    console.log('Inserting grocery items...');
    const db = mongoose.connection.db;

    const itemsWithDates = sampleGroceryItems.map(item => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    await db.collection('groceryitems').insertMany(itemsWithDates);
    console.log('Grocery items inserted successfully');
};

const insertGroceryOrders = async () => {
    console.log('Inserting grocery orders...');
    const db = mongoose.connection.db;

    const users = await db.collection('users').find({ type: { $in: ['resident', 'worker'] } }).toArray();
    const groceryItems = await db.collection('groceryitems').find({}).toArray();

    const sampleOrders = [];

    for (let i = 0; i < 6; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomItems = groceryItems.slice(0, Math.floor(Math.random() * 3) + 1);

        const orderItems = randomItems.map(item => ({
            itemId: item._id,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: item.price
        }));

        const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        sampleOrders.push({
            userId: randomUser._id,
            orderNumber: generateOrderNumber() + '-' + i, // Ensure uniqueness
            items: orderItems,
            totalAmount: Math.round(totalAmount * 100) / 100,
            status: ['pending', 'processing', 'delivered'][Math.floor(Math.random() * 3)],
            orderDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            deliveryDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    await db.collection('groceryorders').insertMany(sampleOrders);
    console.log('Grocery orders inserted successfully');
};

const insertInvoices = async () => {
    console.log('Inserting invoices...');
    const db = mongoose.connection.db;

    const users = await db.collection('users').find({ type: { $in: ['resident', 'worker'] } }).toArray();
    const invoiceTypes = ['rent', 'utilities', 'maintenance', 'grocery'];
    const statuses = ['pending', 'paid', 'overdue'];

    const sampleInvoices = [];

    for (let i = 0; i < 6; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomType = invoiceTypes[Math.floor(Math.random() * invoiceTypes.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        sampleInvoices.push({
            userId: randomUser._id,
            invoiceNumber: generateInvoiceNumber() + '-' + i, // Ensure uniqueness
            amount: Math.floor(Math.random() * 1000) + 100,
            type: randomType,
            status: randomStatus,
            dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            description: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} charges for ${randomUser.name}`,
            paidDate: randomStatus === 'paid' ? new Date() : null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    await db.collection('invoices').insertMany(sampleInvoices);
    console.log('Invoices inserted successfully');
};

const insertMaintenances = async () => {
    console.log('Inserting maintenance requests...');
    const db = mongoose.connection.db;

    const residents = await db.collection('users').find({ type: 'resident' }).toArray();
    const workers = await db.collection('users').find({ type: 'worker' }).toArray();
    const categories = ['plumbing', 'electrical', 'cleaning', 'repair', 'other'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['pending', 'in-progress', 'completed'];

    const maintenanceRequests = [
        { title: 'Leaking faucet in bathroom', description: 'The bathroom faucet has been leaking for days', category: 'plumbing' },
        { title: 'Light fixture not working', description: 'The ceiling light in the bedroom is not turning on', category: 'electrical' },
        { title: 'Room cleaning required', description: 'Deep cleaning needed after move-out', category: 'cleaning' },
        { title: 'Door handle broken', description: 'The door handle is loose and needs repair', category: 'repair' },
        { title: 'Air conditioner maintenance', description: 'AC unit making strange noises', category: 'repair' },
        { title: 'Window glass replacement', description: 'Cracked window glass needs replacement', category: 'other' }
    ];

    const sampleMaintenances = maintenanceRequests.map((request, index) => {
        const randomResident = residents[Math.floor(Math.random() * residents.length)];
        const randomWorker = workers[Math.floor(Math.random() * workers.length)];

        return {
            userId: randomResident._id,
            title: request.title,
            description: request.description,
            category: request.category,
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            assignedTo: randomWorker._id,
            roomNumber: randomResident.roomNumber,
            reportedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            completedDate: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });

    await db.collection('maintenances').insertMany(sampleMaintenances);
    console.log('Maintenance requests inserted successfully');
};

const insertNotifications = async () => {
    console.log('Inserting notifications...');
    const db = mongoose.connection.db;

    const users = await db.collection('users').find({}).toArray();
    const types = ['info', 'warning', 'success', 'error'];
    const categories = ['maintenance', 'invoice', 'grocery', 'general'];

    const notificationTemplates = [
        { title: 'Maintenance Request Update', message: 'Your maintenance request has been assigned to a worker', category: 'maintenance', type: 'info' },
        { title: 'Invoice Due Soon', message: 'Your monthly rent invoice is due in 3 days', category: 'invoice', type: 'warning' },
        { title: 'Grocery Order Delivered', message: 'Your grocery order has been delivered successfully', category: 'grocery', type: 'success' },
        { title: 'Payment Overdue', message: 'Your payment is overdue. Please pay immediately', category: 'invoice', type: 'error' },
        { title: 'Welcome Message', message: 'Welcome to Worker Housing System', category: 'general', type: 'info' },
        { title: 'System Maintenance', message: 'System will be down for maintenance on Sunday', category: 'general', type: 'warning' }
    ];

    const sampleNotifications = notificationTemplates.map((template, index) => {
        const randomUser = users[Math.floor(Math.random() * users.length)];

        return {
            userId: randomUser._id,
            title: template.title,
            message: template.message,
            type: template.type,
            category: template.category,
            read: Math.random() > 0.5,
            sentAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });

    await db.collection('notifications').insertMany(sampleNotifications);
    console.log('Notifications inserted successfully');
};

// Main function to populate all data
const populateAllData = async () => {
    try {
        await connectDB();

        // Clean database first
        await cleanDatabase();

        // Insert all data
        await insertUsers();
        await insertGroceryItems();
        await insertGroceryOrders();
        await insertInvoices();
        await insertMaintenances();
        await insertNotifications();

        console.log('\n✅ All data populated successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Users: 12 (2 admins, 5 residents, 5 workers)`);
        console.log(`- Grocery Items: 6`);
        console.log(`- Grocery Orders: 6`);
        console.log(`- Invoices: 6`);
        console.log(`- Maintenance Requests: 6`);
        console.log(`- Notifications: 6`);

        console.log('\n🔐 Login Credentials:');
        console.log('Admins: admin1/admin123, admin2/admin123');
        console.log('Residents: resident1/resident123, resident2/resident123, etc.');
        console.log('Workers: worker1/worker123, worker2/worker123, etc.');

        process.exit(0);
    } catch (error) {
        console.error('Error populating data:', error);
        process.exit(1);
    }
};

// Run the population
populateAllData();