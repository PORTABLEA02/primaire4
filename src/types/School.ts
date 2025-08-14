export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  foundedYear: string;
  studentCapacity: number;
  motto: string;
  logo?: string;
  isActive: boolean;
  createdDate: string;
  settings: SchoolSettings;
}

export interface SchoolSettings {
  currency: string;
  academicYear: string;
  periods: Period[];
  feeTypes: FeeType[];
  paymentMethods: PaymentMethod[];
  lateFeePercentage: number;
  scholarshipPercentage: number;
}

export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'Trimestre' | 'Semestre';
}

export interface FeeType {
  id: string;
  name: string;
  amount: number;
  level: string;
  mandatory: boolean;
  description: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'mobile' | 'bank';
  enabled: boolean;
  fees: number;
  config: Record<string, any>;
}