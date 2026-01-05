import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteToAdmin(email: string) {
    console.log(`Promoting ${email} to admin...`);

    // 1. Get User ID from Auth API
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (!user) {
        console.error('User not found.');
        return;
    }

    // 1.5 Ensure Profile Exists
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();

    if (!profile) {
        console.log('Profile missing. Creating profile...');
        const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Admin User'
        });
        if (profileError) {
            console.error('Error creating profile:', profileError);
            return;
        }
    }

    // 2. Insert into user_roles
    const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'admin' })
        .select();

    if (error) {
        if (error.code === '23505') { // Unique violation
            console.log('User is already an admin.');
        } else {
            console.error('Error promoting user:', error);
        }
    } else {
        console.log(`SUCCESS! ${email} is now an Admin.`);
    }
}

const email = process.argv[2] || 'aaryan.pathak3108@gmail.com';
promoteToAdmin(email);
