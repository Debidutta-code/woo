// api/agencyApplicationApi.ts

export interface AgencyApplicationData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  
  // Agency Details
  agency_name: string;
  agency_email: string;
  agency_contact: string;
  agency_type: 'travel' | 'corporate';
  address: string;
  tax_number: string;
  iata_code?: string;
}

export interface AgencyStatusResponse {
  success: boolean;
  approved: boolean;
  status: 'pending' | 'approved' | 'rejected'|'not_submitted';
  data: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    agency_name: string;
    agency_email: string;
    agency_contact: string;
    agency_type: string;
    address: string;
    tax_number: string;
    iata_code?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    commission_rate?: {
      type: string;
      value: number;
    };
    assigned_properties?: any[];
  };
}

export interface AgencyApplicationResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    application_id?: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at?: string;
  };
}

class AgencyApplicationApiService {
  private baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Check agency application status for logged-in user
   * GET /api/v1/agencyapplication/status
   * @param token - Access token (required)
   */
  async checkStatus(token: string): Promise<AgencyStatusResponse> {
    try {
      const response = await fetch(`${this.baseURL}/agencyapplication/status`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error checking agency status:', error);
      throw error;
    }
  }

  /**
   * Submit a new agency application
   * POST /api/v1/agencyapplication
   * @param applicationData - The agency application data
   * @param token - Access token (required)
   */
  async submitApplication(
    applicationData: AgencyApplicationData,
    token: string
  ): Promise<AgencyApplicationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/agencyapplication`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to submit application');
      }

      return data;
    } catch (error) {
      console.error('Error submitting agency application:', error);
      throw error;
    }
  }
}

export const agencyApplicationApi = new AgencyApplicationApiService();