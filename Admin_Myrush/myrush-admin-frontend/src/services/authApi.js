import config from '../config';

export async function loginAdmin(mobile, password) {
  try {
    const API_BASE = config.API_URL;
    const response = await fetch(`${API_BASE}/auth/admins/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, password }),
    });

    const data = await response.json();
    return { response, data };
  } catch (error) {
    throw new Error('Network error: ' + error.message);
  }
}
