import { apiRequest } from './api';

export const aiApi = {
  async analyzeHiveImage(file: File) {
    const form = new FormData();
    form.append('image', file);
    return apiRequest<{
      status: string;
      confidence: number;
      message: string;
      model: string;
      disclaimer: string;
    }>('/ai/hive-image-analysis/', {
      method: 'POST',
      body: form,
    });
  },
};
