
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Create the manager first so employee records can reference them.
        let manager = await User.findOne({ email: 'manager@staffsync.com' });

        if (!manager) {
            manager = await User.create({
                name: 'Mohan Das',
                email: 'manager@staffsync.com',
                password: 'manager123',
                role: 'manager',
                department: 'Engineering',
                designation: 'Engineering Manager',
            });
        }

        const accounts = [
            {
                name: 'Hana Rao',
                email: 'hr@staffsync.com',
                password: 'hr12345',
                role: 'hr',
                department: 'People Operations',
                designation: 'HR Lead',
            },
            {
                name: 'Esha Nair',
                email: 'employee@staffsync.com',
                password: 'employee123',
                role: 'employee',
                department: 'Engineering',
                designation: 'Software Engineer',
                manager: manager._id,
            },
            {
                name: 'Ravi Kumar',
                email: 'ravi@staffsync.com',
                password: 'employee123',
                role: 'employee',
                department: 'Engineering',
                designation: 'QA Engineer',
                manager: manager._id,
            },
        ];

        for (const account of accounts) {
            const existing = await User.findOne({ email: account.email });
            if (!existing) {
                await User.create(account);
                console.log(`Created ${account.email}`);
            } else {
                console.log(`Already exists: ${account.email}`);
            }
        }

        const hr = await User.findOne({ email: 'hr@staffsync.com' });

        if (hr && !(await Announcement.exists({ title: 'Welcome to StaffSync' }))) {
            await Announcement.create({
                title: 'Welcome to StaffSync',
                category: 'announcement',
                postedBy: hr._id,
                body: 'Mark your attendance daily and apply for leave from the Leaves page.',
            });
        }

        console.log('Demo account setup finished.');
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
