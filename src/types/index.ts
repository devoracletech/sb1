// Add these interfaces to the existing types
export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSReport {
  id: string;
  sentAt: Date;
  recipients: number;
  delivered: number;
  failed: number;
  message: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}