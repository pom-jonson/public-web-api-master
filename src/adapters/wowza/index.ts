import { AssetResponse } from './types';
import { Response } from 'node-fetch';
import fetch from '@adobe/node-fetch-retry';

export interface WowzaCredentials {
  apiToken: string;
}

const WOWZA_API_BASE_URL = 'https://api.video.wowza.com/api/v1.10';

const DEFAULT_RETRY_OPTIONS = {
  retryMaxDuration: 60000, // 30s retry max duration
  retryInitialDelay: 500,
  retryBackoff: 2.0,
  socketTimeout: 15000, // no backoff
};

export default class Wowza {
  readonly defaultHeaders: Record<string, any>;

  constructor(credentials: WowzaCredentials) {
    this.defaultHeaders = {
      Authorization: `Bearer ${credentials.apiToken}`,
    };
  }

  async createAsset(fileName: string): Promise<AssetResponse> {
    console.log({
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
    });

    const response = await fetch(`${WOWZA_API_BASE_URL}/assets`, {
      method: 'POST',
      body: JSON.stringify({
        asset: {
          file_name: fileName,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
      },
      retryOptions: DEFAULT_RETRY_OPTIONS,
    });

    await this.ensureSuccess(response);

    return (await response.json()) as AssetResponse;
  }

  async requestMultipartUpload(uploadUrl: string): Promise<{ accessUri: string }> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'opc-multipart': 'true',
        ...this.defaultHeaders,
      },
      retryOptions: DEFAULT_RETRY_OPTIONS,
    });

    await this.ensureSuccess(response);

    return (await response.json()) as { accessUri: string };
  }

  async commitMultipartUpload(uploadUrl: string): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
      },
      retryOptions: DEFAULT_RETRY_OPTIONS,
    });

    if (!response.ok) {
      throw new Error('Error committing multipart upload');
    }
  }

  async uploadAsset(uploadUrl: string, assetData: Buffer): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: assetData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...this.defaultHeaders,
      },
      retryOptions: {
        retryMaxDuration: 5 * 60000, // 30s retry max duration
        retryInitialDelay: 500,
        retryBackoff: 1.0,
        socketTimeout: 2.5 * 60000, // no backoff
      },
    });
  }

  async reportAssetUploadCompleted(id: string, duration: number): Promise<AssetResponse> {
    const response = await fetch(`${WOWZA_API_BASE_URL}/assets/${id}/upload_completed`, {
      method: 'PATCH',
      body: JSON.stringify({
        asset: {
          duration,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
      },
      retryOptions: DEFAULT_RETRY_OPTIONS,
    });

    if (!response.ok) {
      throw new Error('Error occurred updating asset');
    }

    return (await response.json()) as AssetResponse;
  }

  async ensureSuccess(response: Response): Promise<void> {
    if (!response.ok) {
      let error: string;
      if (response.status > 400 && response.status < 500) {
        error = JSON.stringify(await response.json());
      } else {
        error = response.status.toString();
      }

      throw new Error(`Error occurred creating asset: ${error}`);
    }
  }
}
