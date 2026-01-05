import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function wipeDatabase() {
    console.log("⚠️  WARNING: THIS WILL DELETE ALL ARTICLES ⚠️");
    console.log("Waiting 3 seconds before destruction...");

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        // Delete all articles (this should cascade delete related data if set up correctly, or just articles)
        const { error } = await supabase
            .from('articles')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything where ID is not empty

        if (error) {
            console.error("Error wiping DB:", error);
        } else {
            console.log("✅ DATABASE WIPED CLEAN.");
            console.log("All articles have been removed.");
            console.log("You can now start a fresh generation cycle.");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

wipeDatabase();
