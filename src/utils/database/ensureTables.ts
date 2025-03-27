
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensure that the necessary tables exist in the Supabase database
 */
export const ensureTables = async () => {
  try {
    // Check if users table exists
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }
    
    const userTableExists = tables?.some(t => t.tablename === 'users');
    
    if (!userTableExists) {
      console.log('Creating users table...');
      // Create users table if it doesn't exist
      const { error } = await supabase.rpc('create_users_table');
      
      if (error) {
        console.error('Error creating users table:', error);
      } else {
        console.log('Users table created successfully');
      }
    }
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
  }
};
