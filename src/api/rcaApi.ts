import axios from 'axios';

// Use environment variables for API base URL and endpoint to avoid hardcoding
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const RCA_FLOW_ENDPOINT = import.meta.env.VITE_RCA_FLOW_ENDPOINT;

export const runRcaFlow = async (file: File) => {
    if (!API_BASE_URL || !RCA_FLOW_ENDPOINT) {
        throw new Error('API configurations are missing in the .env file.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}${RCA_FLOW_ENDPOINT}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
