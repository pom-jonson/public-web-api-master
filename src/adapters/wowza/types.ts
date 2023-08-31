export interface AssetResponse {
  asset: Asset;
}

export interface Asset {
  id: string;
  file_name: string;
  upload_url?: string;
}
