
import { API_ENDPOINTS, getAuthHeaders } from "../api/config";

/**
 * Check if the users table exists, and create it if it doesn't
 */
export const ensureTables = async (): Promise<void> => {
  try {
    console.log("Checking if users table exists...");
    
    const checkResponse = await fetch(API_ENDPOINTS.CHECK_USERS_TABLE, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const checkData = await checkResponse.json();
    
    if (!checkResponse.ok) {
      console.log("Users table check failed, attempting to create table...");
      
      const createResponse = await fetch(API_ENDPOINTS.CREATE_USERS_TABLE, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const createData = await createResponse.json();
      
      if (!createResponse.ok) {
        console.error("Error creating users table:", createData.error);
      } else {
        console.log("Users table created successfully");
      }
    } else {
      console.log("Users table check successful:", checkData.message);
    }
  } catch (error) {
    console.error("Error ensuring tables exist:", error);
  }
};
