import axios from 'axios';

// Use the environment variable if available, otherwise default to localhost
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});