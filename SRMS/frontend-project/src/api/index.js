import axios from 'axios'

const BASE = '/api'

// Auth
export const registerUser = (data) => axios.post(`${BASE}/auth/register`, data)
export const loginUser = (data) => axios.post(`${BASE}/auth/login`, data)

// Customers
export const getCustomers = () => axios.get(`${BASE}/customers`)
export const getCustomer = (id) => axios.get(`${BASE}/customers/${id}`)
export const createCustomer = (data) => axios.post(`${BASE}/customers`, data)
export const updateCustomer = (id, data) => axios.put(`${BASE}/customers/${id}`, data)
export const deleteCustomer = (id) => axios.delete(`${BASE}/customers/${id}`)

// Products
export const getProducts = () => axios.get(`${BASE}/products`)
export const getProduct = (id) => axios.get(`${BASE}/products/${id}`)
export const createProduct = (data) => axios.post(`${BASE}/products`, data)
export const updateProduct = (id, data) => axios.put(`${BASE}/products/${id}`, data)
export const deleteProduct = (id) => axios.delete(`${BASE}/products/${id}`)

// Sales
export const getSales = () => axios.get(`${BASE}/sales`)
export const getSale = (id) => axios.get(`${BASE}/sales/${id}`)
export const createSale = (data) => axios.post(`${BASE}/sales`, data)
export const updateSale = (id, data) => axios.put(`${BASE}/sales/${id}`, data)
export const deleteSale = (id) => axios.delete(`${BASE}/sales/${id}`)

// Reports
export const getReportSummary = () => axios.get(`${BASE}/reports/summary`)
export const getReport = (type) => axios.get(`${BASE}/reports/${type}`)
