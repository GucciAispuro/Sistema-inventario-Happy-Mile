
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
      
      // Check for users with receive_alerts = true
      const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('receive_alerts', true);
      
      if (adminError) {
        console.error('Error checking for admin users:', adminError);
      } else {
        console.log(`Found ${adminUsers?.length || 0} users with alerts enabled`);
      }
    }
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
  }
};
