const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Warning: SUPABASE_URL or SUPABASE_KEY missing. Set them in backend/.env'
  );
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
