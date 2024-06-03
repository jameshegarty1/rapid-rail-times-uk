import { jwtDecode, JwtPayload } from 'jwt-decode';
import axios from 'axios';
import qs from 'qs';

interface CustomJwtPayload extends JwtPayload {
  permissions: string;
}

export const isAuthenticated = () => {
  const permissions = localStorage.getItem('permissions');
  if (!permissions) {
    return false;
  }
  return !!(permissions === 'user' || permissions === 'admin');
};

/**
 * Login to backend and store JSON web token on success
 *
 * @param email
 * @param password
 * @returns JSON data containing access token on success
 * @throws Error on http errors or failed attempts
 */
export const login = async (email: string, password: string) => {
  // Assert email or password is not empty
  console.log("Processing login attempt with email:", email);
  if (!(email.length > 0) || !(password.length > 0)) {
    throw new Error('Email or password was not provided');
  }

  console.log("Before making API request...");
  try {
    const data = { username: email, password: password };
    const response = await axios.post('/api/v1/auth/token', qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log("Got a response!")

    const responseData = response.data;

    if (response.status >= 400 && response.status < 500) {
      if (responseData.detail) {
        throw new Error(responseData.detail);
      }
      throw new Error(responseData);
    }

    if ('access_token' in responseData) {
      console.log("Saving token")
      const decodedToken: any = jwtDecode<CustomJwtPayload>(responseData.access_token);
      localStorage.setItem('token', responseData.access_token);
      localStorage.setItem('permissions', decodedToken.permissions);
    }

    return data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    } else {
      throw new Error('Internal server error');
    }
  }
};

/**
 * Sign up via backend and store JSON web token on success
 *
 * @param email
 * @param password
 * @returns JSON data containing access token on success
 * @throws Error on http errors or failed attempts
 */
export const signUp = async (
  email: string,
  password: string,
  passwordConfirmation: string
) => {
  // Assert email or password or password confirmation is not empty
  if (!(email.length > 0)) {
    throw new Error('Email was not provided');
  }
  if (!(password.length > 0)) {
    throw new Error('Password was not provided');
  }
  if (!(passwordConfirmation.length > 0)) {
    throw new Error('Password confirmation was not provided');
  }

  try {
    const data = { username: email, password: password };
    const response = await axios.post('/api/v1/auth/signup', qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const responseData = response.data;

    if (response.status >= 400 && response.status < 500) {
      if (responseData.detail) {
        throw new Error(responseData.detail);
      }
      throw new Error(responseData);
    }

    if ('access_token' in responseData) {
      const decodedToken = jwtDecode<CustomJwtPayload>(responseData.access_token);
      localStorage.setItem('token', responseData.access_token);
      localStorage.setItem('permissions', decodedToken.permissions);
    }

    return responseData;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    } else {
      throw new Error('Internal server error');
    }
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('permissions');
};

