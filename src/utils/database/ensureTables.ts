
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensure that the necessary tables exist in the Supabase database
 */
export const ensureTables = async () => {
  try {
    // Check if users table exists by querying a single row
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking users table:', error);
    } else {
      console.log('Users table exists and is accessible');
    }
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
  }
};
