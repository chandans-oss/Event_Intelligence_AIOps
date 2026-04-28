import axios from 'axios';

// Use environment variables for API base URL and endpoint to avoid hardcoding
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const RAG_API_ENDPOINT = import.meta.env.VITE_RAG_API_ENDPOINT;
const RCA_API_ENDPOINT = import.meta.env.VITE_RCA_API_ENDPOINT;

export const runRcaFlow = async (file: File) => {
    if (!API_BASE_URL || !RCA_API_ENDPOINT) {
        throw new Error('RCA API configurations are missing in the .env file.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}${RCA_API_ENDPOINT}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const runRagAnalysis = async (payload: any) => {
    if (!API_BASE_URL || !RAG_API_ENDPOINT) {
        throw new Error('RAG API configurations are missing in the .env file.');
    }

    const response = await axios.post(`${API_BASE_URL}${RAG_API_ENDPOINT}`, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};
