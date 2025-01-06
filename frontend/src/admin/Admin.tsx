import React from 'react';
import { fetchUtils, Admin as ReactAdmin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import authProvider from './authProvider';

import { UserList, UserEdit, UserCreate } from './Users';

// Define the custom HTTP client
const httpClient = (url: string, options: RequestInit = {}) => {
  // Ensure headers are initialized
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  } else if (!(options.headers instanceof Headers)) {
    options.headers = new Headers(options.headers);
  }

  // Add the Authorization token to the headers
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);

  // Perform the request using fetchUtils from react-admin
  return fetchUtils.fetchJson(url, options);
};

// Initialize the data provider with the custom HTTP client
const dataProvider = simpleRestProvider('api/v1', httpClient);

// Admin component definition without using FC type
export function Admin() {
  return (
    <ReactAdmin dataProvider={dataProvider} authProvider={authProvider}>
      {(permissions: 'admin' | 'user') => 
        permissions === 'admin' ? (
          <Resource
            name="users"
            list={UserList}
            edit={UserEdit}
            create={UserCreate}
          />
        ) : null
      }
    </ReactAdmin>
  );
}

