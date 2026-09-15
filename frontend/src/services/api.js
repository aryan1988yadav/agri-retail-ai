import axios from 'axios';

const API_HOST = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${API_HOST}:8000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products & Categories
export const getCategories = () => api.get('/products/categories');
export const getProducts = (params) => api.get('/products', { params });
export const getProductDetail = (id) => api.get(`/products/${id}`);
export const adjustProductStock = (id, adjustment) => api.patch(`/products/${id}/stock?adjustment=${adjustment}`);

// POS Counter Billing
export const createPOSSale = (saleData) => api.post('/pos/sales', saleData);
export const getPOSSales = (limit = 30) => api.get(`/pos/sales?limit=${limit}`);
export const getPOSDailySummary = () => api.get('/pos/daily-summary');

// Online Orders
export const placeOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = () => api.get('/orders');

// Inventory Stats
export const getInventoryStats = () => api.get('/inventory/stats');
export const getLowStockAlerts = () => api.get('/inventory/low-stock');

// ML Prediction Engine
export const predictCrop = (cropData) => api.post('/prediction/crop', cropData);
export const adviseFertilizer = (fertilizerData) => api.post('/prediction/fertilizer', fertilizerData);

// Kisan Mandi (Farmer Crop Selling & Trade)
export const getCropListings = (params) => api.get('/mandi/listings', { params });
export const createCropListing = (listingData) => api.post('/mandi/listings', listingData);
export const getMSPBenchmarks = () => api.get('/mandi/msp');

export default api;
