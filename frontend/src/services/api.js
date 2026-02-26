import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

// Accept declaration
export const acceptDeclaration = async () => {
    const response = await api.post('/auth/accept-declaration/');
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

// Upload directly to S3 using PUT
export const uploadDirectlyToS3 = async (presignedUrl, file, contentType) => {
    // We use a raw fetch or standard axios without interceptors so we don't send auth headers to S3
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': contentType,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to upload file to S3');
    }
    return response;
};

// --- Qualification Documents ---
export const getDocumentUploadUrl = async (data) => {
    const response = await api.post('/documents/get-upload-url/', data);
    return response.data;
};

export const uploadDocument = async (qualificationType, documentType, file) => {
    // 1. Get Presigned URL
    const fileExt = file.name.split('.').pop();
    const urlData = await getDocumentUploadUrl({
        filename: file.name,
        file_ext: fileExt,
        content_type: file.type
    });

    // 2. Upload to S3
    await uploadDirectlyToS3(urlData.url, file, file.type);

    // 3. Save to DB
    const response = await api.post('/documents/upload/', {
        qualification_type: qualificationType,
        document_type: documentType,
        s3_path: urlData.path
    });
    return response.data;
};

// Get consultant documents
export const getDocuments = async () => {
    const response = await api.get('/auth/documents/list/');
    return response.data;
};


// --- Face Verification ---
export const uploadFaceVerificationPhoto = async (userId, formData) => {
    const response = await api.post(`/face-verification/users/${userId}/upload-photo/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const verifyFace = async (userId, data) => {
    const response = await api.post(`/face-verification/users/${userId}/verify-face/`, data);
    return response.data;
};


// --- Identity Verification ---
export const getIdentityDocUploadUrl = async (data) => {
    const response = await api.post('/auth/identity/get-upload-url/', data);
    return response.data;
};

export const uploadIdentityDocument = async (file) => {
    // 1. Get Presigned URL
    const fileExt = file.name.split('.').pop();
    const urlData = await getIdentityDocUploadUrl({
        file_ext: fileExt,
        content_type: file.type
    });

    // 2. Upload to S3
    await uploadDirectlyToS3(urlData.url, file, file.type);

    // 3. Save to DB
    const response = await api.post('/auth/identity/upload-doc/', {
        s3_path: urlData.path
    });
    return response.data;
};

// --- Assessment API ---
export const getTestTypes = async () => {
    const response = await api.get('/assessment/test-types/');
    return response.data;
};

export const createSession = async (data) => {
    const response = await api.post('/assessment/sessions/', data);
    return response.data;
};

export const submitTest = async (sessionId, data) => {
    const response = await api.post(`/assessment/sessions/${sessionId}/submit_test/`, data);
    return response.data;
};

export const getVideoUploadUrl = async (sessionId, data) => {
    const response = await api.post(`/assessment/sessions/${sessionId}/get_video_upload_url/`, data);
    return response.data;
};

export const submitVideo = async (sessionId, questionId, file) => {
    // 1. Get Presigned URL
    const fileExt = file.name.split('.').pop();
    const urlData = await getVideoUploadUrl(sessionId, {
        question_id: questionId,
        file_ext: fileExt,
        content_type: file.type
    });

    // 2. Upload to S3
    await uploadDirectlyToS3(urlData.url, file, file.type);

    // 3. Save to DB and trigger eval
    const response = await api.post(`/assessment/sessions/${sessionId}/submit_video/`, {
        question_id: questionId,
        s3_path: urlData.path
    });
    return response.data;
};

export const logViolation = async (sessionId, data) => {
    const response = await api.post(`/assessment/sessions/${sessionId}/log_violation/`, data);
    return response.data;
};

export const getLatestResult = async () => {
    const response = await api.get('/assessment/sessions/latest_result/');
    return response.data;
};

export const processProctoringSnapshot = async (sessionId, formData) => {
    const response = await api.post(`/assessment/sessions/${sessionId}/process_proctoring_snapshot/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export default api;
