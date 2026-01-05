import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function confirmUser(email: string) {
    console.log(`Looking for user: ${email}...`);

    // 1. List users to find the ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`User with email ${email} not found.`);
        console.log('Available users:', users.map(u => u.email).join(', '));
        return;
    }

    console.log(`Found user ${user.id}. Confirming email...`);

    // 2. Update user to set email_confirmed_at
    const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
    );

    if (error) {
        console.error('Error confirming user:', error);
    } else {
        console.log(`SUCCESS! User ${email} has been confirmed.`);
    }
}

// Get email from command line arg or default to 'admin@test.com'
const email = process.argv[2] || 'admin@test.com';
confirmUser(email);
