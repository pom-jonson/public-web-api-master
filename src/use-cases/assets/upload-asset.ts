import { FilePayload } from '../../controllers/assets/upload-asset';
import CustomerAccount from '../../entities/customer-account';
import Asset from '../../entities/asset';
import EntryLocation, { EntryType } from '../../entities/entry-location';
import InvalidRequestError from '../../controllers/middleware/invalid-request-error';
import { validateImage } from '../../utils';

export interface Dependencies {
  bucket: string;
  getPublicPath(fileLocation: EntryLocation): Promise<string>;
  listEntries(folderLocation: EntryLocation, entryType: EntryType): Promise<EntryLocation[]>;
  deleteObject(fileLocation: EntryLocation): Promise<void>;
  putObject(objectLocation: string, objectBuffer: Buffer): Promise<void>;
}

export interface UploadAssetQM {
  customerEmail: string;
  file: FilePayload;
  type: string;
}

export interface UploadAssetVM {
  [key: string]: {
    path: string;
  };
}

export default async function uploadAsset(
  { customerEmail, file, type }: UploadAssetQM,
  { bucket, getPublicPath, listEntries, deleteObject, putObject }: Dependencies,
): Promise<UploadAssetVM[]> {
  const { filename, content } = file;
  const location = new EntryLocation(filename);

  if (!Asset.getAllowedFileTypes().includes(location.getFileExtension())) {
    throw new Error(`File type not supported. Uploaded file type: ${location.getFileExtension()}`);
  }
  if (Asset.isAllowedImage(location.getFileExtension())) {
    try {
      validateImage(file.content, {
        allowedTypes: Asset.getAllowedImageTypes(),
        allowedResolutions: Asset.getAllowedImageSizes(),
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InvalidRequestError(e.message);
      }
      throw e;
    }
  }

  const customerAccount = CustomerAccount.fromEmail(bucket, customerEmail);
  const assetsLocation = customerAccount.getAssetsLocation();
  const assetsList = {};

  const oldAssets = await listEntries(assetsLocation, 'file');
  for (const asset of oldAssets) {
    asset.getFileStem() === type && (await deleteObject(asset));
  }

  const fileLocation = assetsLocation.getModification(`/${type}.${location.getFileExtension()}`);
  await putObject(fileLocation.getFullUri(), content);

  assetsList[type] = {
    path: await getPublicPath(fileLocation),
  };

  return assetsList as UploadAssetVM[];
}
