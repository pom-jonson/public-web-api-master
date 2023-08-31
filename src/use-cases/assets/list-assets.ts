import CustomerAccount from '../../entities/customer-account';
import EntryLocation, { EntryType } from '../../entities/entry-location';

export interface Dependencies {
  accountBucketPrefix: string;
  listEntries(folderLocation: EntryLocation, entryType: EntryType): Promise<EntryLocation[]>;
  getPath(fileLocation: EntryLocation): Promise<string>;
}

interface ListAssetQM {
  customerEmail: string;
}

export interface ListAssetVM {
  [key: string]: {
    path: string;
  };
}

export default async function listAssets(
  { customerEmail }: ListAssetQM,
  { accountBucketPrefix, listEntries, getPath }: Dependencies,
): Promise<ListAssetVM> {
  const customerAccount = CustomerAccount.fromEmail(accountBucketPrefix, customerEmail);
  const assetsLocation = customerAccount.getAssetsLocation();

  const assets = await listEntries(assetsLocation, 'file');

  const assetsList = {
    intro: {
      path: null,
    },
    outro: {
      path: null,
    },
  };

  for (const asset of assets) {
    const path = await getPath(asset);
    assetsList[asset.getFileStem()] = { path };
  }
  return assetsList as ListAssetVM;
}
