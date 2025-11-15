// User Types
export interface UserDto {
  id: string;
  fullname: string;
  phone: string;
  email: string;
  country_code: string;
  code_phone: string;
  status: "INIT" | "COMPLETE" | "PENDING";
  firebaseNotificationToken: string;
  balance: number;
  role: "CLIENT" | "MERCHANT" | "ADMIN";
  kyc_status: string;
  name: string;
  surname: string;
  birth_day: number;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: UserDto;
  auth_token: string;
  expire_at: string;
}

export interface CreateUserDto {
  fullname: string;
  email: string;
  password: string;
}

export interface CompleteUserDto {
  phone: string;
  code_phone: string;
}

export interface UserAuthenticationOtpDto {
  email: string;
}

export interface UserVerifyOtpDto {
  user_id: string;
  otp_code: string;
}

export interface NewPasswordDto {
  password: string;
  otp_code: string;
}

// Payment Types
export interface PaymentResponseDto {
  id: string;
  amount: number;
  reference?: string;
  description?: string;
  status: "INIT" | "INEXECUTION" | "PENDING" | "COMPLETE" | "FAILED" | "TIMEOUT";
  transaction_type?: "PAYMENT" | "DIRECT_PAYMENT" | "TRANSFERT" | "RECHARGE";
  launch_url?: string;
  createdAt?: string;
  organisation?: {
    id: string;
    libelle?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    apiKeys?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface NewCreatePaymentDto {
  amount: number;
  description: string;
  organisation_id?: string;
  extra_data?: Record<string, unknown>;
}

export interface NewCreateDirectPaymentDto {
  amount: number;
  description: string;
  phone: string;
  service_mobile_code?: string;
  organisation_id?: string;
  extra_data?: Record<string, unknown>;
}

export interface FilterDto {
  transaction_type: "PAYMENT" | "DIRECT_PAYMENT" | "TRANSFERT" | "RECHARGE";
  status: "INIT" | "INEXECUTION" | "PENDING" | "COMPLETE" | "FAILED" | "TIMEOUT";
  dateFrom: number;
  dateTo: number;
}

export interface TransactionStatusResponseDto {
  status: boolean;
}

// Organisation Types
export interface CreateOrganisationDto {
  libelle: string;
  web_site: string;
  description?: string;
}

export interface UpdateOrganisationDto {
  description?: string;
}

export interface GenerateApiKeyOrganisationDto {
  title: string;
  description?: string;
}

export interface CreateWebhookDto {
  link: string;
  title?: string;
}

export interface UpdateWebhookDto {
  link?: string;
  title?: string;
}

// Beneficiary Types
export interface CreateBeneficiaireDto {
  name: string;
  phone: string;
  country_id: string;
  code_phone?: string;
}

export interface UpdateBeneficiaireDto {
  name?: string;
}

// Country Types
export interface CountryResponseDto {
  id: string;
  codeIso2: string;
  libelle: string;
  transactionsEnabled: boolean;
  authEnabled: boolean;
}

// Mobile Service Types
export interface ServiceMobileResponseDto {
  id: string;
  name: string;
  country: string;
  code_prefix: string;
  api_endpoint: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface AnalyticsOverviewResponseDto {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  failedTransactions: number;
  commissions: number;
}

export interface AnalyticsGraphDataResponseDto {
  data: Array<Record<string, unknown>>;
}

export interface AnalyticsTopBeneficiariesResponseDto {
  beneficiaries: Array<Record<string, unknown>>;
}

// Transfer Types
export interface CreateTransfertDto {
  amount: number;
  name: string;
  phone: string;
  service_mobile_code: string;
}

// Error Types
export interface IDisplayText {
  lang: string;
  value: string;
}

export interface IAppError {
  code: string;
  message: string;
  display_messages?: IDisplayText[];
  details?: Record<string, unknown>;
  status_code?: number;
  url?: string;
}

export interface IAppErrorDto {
  error: IAppError;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

