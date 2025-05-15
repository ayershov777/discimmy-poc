import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiService {
    // Pathway AI generation
    async generatePathwayProperties(pathwayId, properties, apply = false, formData = null) {
        try {
            const requestData = {
                pathwayId,
                properties,
                apply
            };

            // If formData is provided (for new pathways), include it in the request
            if (formData && pathwayId === 'new') {
                Object.assign(requestData, formData);
            }

            const response = await axios.post(`${API_URL}/ai/generate-pathway-properties`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error generating pathway properties:', error);
            throw error;
        }
    }

    // Module AI generation
    async generateModuleProperties(moduleId, properties, apply = false, pathwayData = null, formData = null) {
        try {
            const requestData = {
                moduleId,
                properties,
                apply
            };

            // If formData is provided (for new modules), include it in the request
            if (formData && moduleId === 'new') {
                Object.assign(requestData, formData);
            }

            // If pathwayData is provided, include the pathwayId
            if (pathwayData) {
                requestData.pathwayId = pathwayData._id;
            }

            const response = await axios.post(`${API_URL}/ai/generate-module-properties`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error generating module properties:', error);
            throw error;
        }
    }

    // Pathway structure generation
    async generatePathwayStructure(pathwayId, userPrompt, attachedFiles = [], apply = false) {
        try {
            const response = await axios.post(`${API_URL}/ai/generate-pathway-structure`, {
                pathwayId,
                userPrompt,
                attachedFiles,
                apply
            });
            return response.data;
        } catch (error) {
            console.error('Error generating pathway structure:', error);
            throw error;
        }
    }

    async applyPathwayStructure(pathwayId, structure) {
        try {
            const response = await axios.post(`${API_URL}/ai/apply-pathway-structure`, {
                pathwayId,
                structure
            });
            return response.data;
        } catch (error) {
            console.error('Error applying pathway structure:', error);
            throw error;
        }
    }
}

export default new ApiService();
