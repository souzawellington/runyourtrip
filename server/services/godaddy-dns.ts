
import axios from 'axios';

interface DNSRecord {
  type: string;
  name: string;
  data: string;
  ttl?: number;
}

export class GoDaddyDNSService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private isProduction: boolean;

  constructor() {
    // Check for production credentials first, then fall back to OTE credentials
    this.isProduction = process.env.GODADDY_ENVIRONMENT === 'production';
    
    if (this.isProduction) {
      this.apiKey = process.env.GODADDY_API_KEY || '';
      this.apiSecret = process.env.GODADDY_API_SECRET || '';
      this.baseUrl = 'https://api.godaddy.com/v1';
    } else {
      this.apiKey = process.env.OTE_GODADDY_API_KEY || '';
      this.apiSecret = process.env.OTE_GODADDY_API_SECRET || '';
      this.baseUrl = 'https://api.ote-godaddy.com/v1';
    }

    if (!this.apiKey || !this.apiSecret) {
      const envVarNames = this.isProduction 
        ? 'GODADDY_API_KEY and GODADDY_API_SECRET'
        : 'OTE_GODADDY_API_KEY and OTE_GODADDY_API_SECRET';
      throw new Error(`GoDaddy API credentials not found. Please set ${envVarNames} in Replit Secrets.`);
    }

    console.log(`GoDaddy DNS Service initialized in ${this.isProduction ? 'PRODUCTION' : 'OTE (Test)'} mode`);
  }

  private getHeaders() {
    return {
      'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Add or update a DNS record for domain verification
   */
  async addVerificationRecord(domain: string, verificationValue: string): Promise<void> {
    try {
      // For OpenAI domain verification, we need to add a TXT record
      const records: DNSRecord[] = [
        {
          type: 'TXT',
          name: '@', // Root domain
          data: verificationValue,
          ttl: 3600
        }
      ];

      await axios.patch(
        `${this.baseUrl}/domains/${domain}/records/TXT/@`,
        records,
        { headers: this.getHeaders() }
      );

      console.log(`Successfully added TXT record for ${domain}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GoDaddy API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get all DNS records for a domain
   */
  async getDNSRecords(domain: string, type?: string): Promise<DNSRecord[]> {
    try {
      const url = type 
        ? `${this.baseUrl}/domains/${domain}/records/${type}`
        : `${this.baseUrl}/domains/${domain}/records`;

      const response = await axios.get(url, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GoDaddy API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Add A record for Replit deployment
   */
  async addReplitARecord(domain: string, ipAddress: string): Promise<void> {
    try {
      const records: DNSRecord[] = [
        {
          type: 'A',
          name: '@',
          data: ipAddress,
          ttl: 3600
        }
      ];

      await axios.patch(
        `${this.baseUrl}/domains/${domain}/records/A/@`,
        records,
        { headers: this.getHeaders() }
      );

      console.log(`Successfully added A record for ${domain}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GoDaddy API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Add multiple DNS records at once
   */
  async addMultipleRecords(domain: string, records: DNSRecord[]): Promise<void> {
    try {
      for (const record of records) {
        await axios.patch(
          `${this.baseUrl}/domains/${domain}/records/${record.type}/${record.name}`,
          [record],
          { headers: this.getHeaders() }
        );
      }

      console.log(`Successfully added ${records.length} DNS records for ${domain}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GoDaddy API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Verify domain ownership by checking if TXT record exists
   */
  async verifyDomainOwnership(domain: string, expectedValue: string): Promise<boolean> {
    try {
      const txtRecords = await this.getDNSRecords(domain, 'TXT');
      return txtRecords.some(record => 
        record.name === '@' && record.data === expectedValue
      );
    } catch (error) {
      console.error('Error verifying domain ownership:', error);
      return false;
    }
  }
}

export const godaddyDNSService = new GoDaddyDNSService();
