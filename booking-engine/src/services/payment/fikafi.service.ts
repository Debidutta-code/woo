// Fikafi Payment Service for Frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface FikafiCreatePaymentLinkPayload {
  bookingRefNum: string;
  guestDetails: {
    guestName: string;
    phoneNum: string;
    email: string;
    country: string;
  };
  bookingDetails: {
    propertyID: string;
    referenceDetails: string;
    communicationMode: 'EMAIL' | 'WHATSAPP';
    arrivalDate: string;
    numberOfNights: number;
  };
  paymentDetails: {
    currency: string;
    totalAmounts: number;
    numOfPayments: number;
    validity: string;
    payments: Array<{
      paymentNumber: number;
      amount: number;
      date: string;
    }>;
  };
  returnURL: {
    success_url: string;
    failed_url: string;
  };
  webhook: {
    payment_event_url: string;
  };
}

export interface FikafiPaymentLinkResponse {
  success: boolean;
  message: string;
  data: {
    paymentLink: string;
    referenceNumber: string;
    paymentId: string;
  };
}

export interface FikafiPaymentStatusResponse {
  success: boolean;
  message: string;
  data: {
    referenceNumber: string;
    status: string;
    amount: number;
    currency: string;
    paymentDate?: string;
    transactionId?: string;
  };
}

class FikafiService {
  /**
   * Create a payment link via Fikafi
   */
  async createPaymentLink(payload: FikafiCreatePaymentLinkPayload): Promise<FikafiPaymentLinkResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/fikafi/create-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create Fikafi payment link');
      }

      return data;
    } catch (error) {
      console.error('Error creating Fikafi payment link:', error);
      throw error;
    }
  }

  /**
   * Get payment status by reference number
   */
  async getPaymentStatus(referenceNumber: string): Promise<FikafiPaymentStatusResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/fikafi/payment-status/${referenceNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get Fikafi payment status');
      }

      return data;
    } catch (error) {
      console.error('Error fetching Fikafi payment status:', error);
      throw error;
    }
  }

  /**
   * Check if payment was successful
   */
  isPaymentSuccessful(paymentStatus: FikafiPaymentStatusResponse): boolean {
    const successStates = ['SUCCESS', 'COMPLETED', 'PAID'];
    return successStates.includes(paymentStatus.data?.status?.toUpperCase());
  }

  /**
   * Get payment state from payment status
   */
  getPaymentState(paymentStatus: FikafiPaymentStatusResponse): string {
    return paymentStatus.data?.status || 'UNKNOWN';
  }
}

export const fikafiService = new FikafiService();