import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Google Authentication
export const googleAuth = async (token) => {
    const response = await api.post('/auth/google/', { token });
    return response.data;
};

// Complete onboarding
export const completeOnboarding = async (data) => {
    const response = await api.post('/auth/onboarding/', data);
    return response.data;
};

// Get user profile
export const getUserProfile = async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
};

// Logout
export const logout = async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
};

// Health check
export const healthCheck = async () => {
    const response = await api.get('/auth/health/');
    return response.data;
};

// Upload consultant document
export const uploadDocument = async (formData) => {
    const response = await api.post('/documents/upload/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Get consultant documents
export const getDocuments = async () => {
    const response = await api.get('/documents/list/');
    return response.data;
};

// Save expertise
export const saveExpertise = async (data) => {
    const response = await api.post('/auth/expertise/', data);
    return response.data;
};

// Face Verification - Upload ID Photo
export const uploadFaceVerificationPhoto = async (userId, formData) => {
    const response = await api.post(`/face-verification/users/${userId}/upload-photo/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Face Verification - Verify Face
export const verifyFace = async (userId, data) => {
    const response = await api.post(`/face-verification/users/${userId}/verify-face/`, data);
    return response.data;
};

export default api;
