import axios from 'axios';
import { getConfig } from './config.js';

function getClient() {
  const baseUrl = getConfig('baseUrl') || 'https://api.openfintech.io/v1';
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

export async function getBanks(params = {}) {
  const client = getClient();
  const response = await client.get('/banks', { params });
  return response.data;
}

export async function getBank(id) {
  const client = getClient();
  const response = await client.get(`/banks/${id}`);
  return response.data;
}

export async function getCurrencies(params = {}) {
  const client = getClient();
  const response = await client.get('/currencies', { params });
  return response.data;
}

export async function getCurrency(id) {
  const client = getClient();
  const response = await client.get(`/currencies/${id}`);
  return response.data;
}

export async function getCountries(params = {}) {
  const client = getClient();
  const response = await client.get('/countries', { params });
  return response.data;
}

export async function getCountry(id) {
  const client = getClient();
  const response = await client.get(`/countries/${id}`);
  return response.data;
}

export async function getPaymentMethods(params = {}) {
  const client = getClient();
  const response = await client.get('/payment-methods', { params });
  return response.data;
}

export async function getPaymentMethod(id) {
  const client = getClient();
  const response = await client.get(`/payment-methods/${id}`);
  return response.data;
}

export async function getDepositMethods(params = {}) {
  const client = getClient();
  const response = await client.get('/deposit-methods', { params });
  return response.data;
}

export async function getDepositMethod(id) {
  const client = getClient();
  const response = await client.get(`/deposit-methods/${id}`);
  return response.data;
}

export async function getExchangers(params = {}) {
  const client = getClient();
  const response = await client.get('/exchangers', { params });
  return response.data;
}

export async function getExchanger(id) {
  const client = getClient();
  const response = await client.get(`/exchangers/${id}`);
  return response.data;
}

export async function getOrganizations(params = {}) {
  const client = getClient();
  const response = await client.get('/organizations', { params });
  return response.data;
}

export async function getOrganization(id) {
  const client = getClient();
  const response = await client.get(`/organizations/${id}`);
  return response.data;
}

export async function getMerchantIndustries(params = {}) {
  const client = getClient();
  const response = await client.get('/merchant-industries', { params });
  return response.data;
}

export async function getMerchantIndustry(id) {
  const client = getClient();
  const response = await client.get(`/merchant-industries/${id}`);
  return response.data;
}
