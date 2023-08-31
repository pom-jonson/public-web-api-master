import fetch from 'node-fetch';
import { GET_TINY_URL_API_KEY } from '../../../runtime-config';

export interface TinyUrl {
  domain: string;
  alias: string;
  url: string;
  expires_at: string;
}

export interface TinyUrlError {
  code: number;
  data: any;
  errors: string[];
}

const TINY_URL_API_BASE_URL = 'https://api.tinyurl.com';

export async function createTinyUrl(
  url: string,
  domain: string,
  alias: string,
  tags: string,
  expiresAt: string,
): Promise<TinyUrl> {
  const response = await fetch(
    `${TINY_URL_API_BASE_URL}/create?api_token=${GET_TINY_URL_API_KEY()}`,
    {
      method: 'POST',
      body: JSON.stringify({
        url,
        domain,
        alias,
        tags,
        expires_at: expiresAt,
      }),
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as TinyUrlError;
    if (error && error.errors.length > 0) {
      throw new Error(`${error.errors[0]}`);
    } else {
      throw new Error(`${response.status} - ${response.statusText}`);
    }
  }

  const { data } = (await response.json()) as { data: TinyUrl };

  return data;
}

export async function getTinyUrl(domain: string, alias: string): Promise<TinyUrl> {
  const response = await fetch(
    `${TINY_URL_API_BASE_URL}/alias/${domain}/${alias}?api_token=${GET_TINY_URL_API_KEY()}`,
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    if (response.status === 422) {
      return null;
    } else {
      const error = (await response.json()) as TinyUrlError;
      if (error && error.errors.length > 0) {
        throw new Error(`${error.errors[0]}`);
      } else {
        throw new Error(`${response.status} - ${response.statusText}`);
      }
    }
  }

  const { data } = (await response.json()) as { data: TinyUrl };
  return data;
}
