import EntryLocation, { EntryType } from '../../entities/entry-location';
import Clip from '../../entities/clip';
import Project from '../../entities/project';
import { createTinyUrl, getTinyUrl } from '../../adapters/tinyurl';
import moment from 'moment';
import { GET_TINY_URL_DOMAIN } from '../../../runtime-config';

export interface Dependencies {
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
  ): Promise<EntryLocation[]>;
  getSharePath(fileLocation: EntryLocation): Promise<string>;
}

export interface GetProjectShareUrlsQM {
  projectPath: string;
}

export interface ShareUrlVM {
  name: string;
  url: string;
}

export interface ProjectShareUrlsVM {
  original: ShareUrlVM;
  edits: ShareUrlVM[];
}

const encodeAlias = (alias: string): string => {
  const buff = new Buffer(alias);
  const base64 = buff.toString('base64');
  return base64.replace(/=+$/, '');
};

const getShortUrl = async (urlName: string, path: string): Promise<string> => {
  const domain = GET_TINY_URL_DOMAIN();
  const alias = encodeAlias(urlName);

  try {
    let tinyUrl = await getTinyUrl(domain, alias);

    if (tinyUrl === null || moment(tinyUrl.expires_at).diff(moment()) < 0) {
      const expiresAt = moment().add(5, 'days').format();
      tinyUrl = await createTinyUrl(path, domain, alias, '', expiresAt);
    }

    const shortUrl = `https://${domain}/${alias}`;
    return shortUrl;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export default async function getProjectShareUrls(
  { projectPath }: GetProjectShareUrlsQM,
  { listEntries, getSharePath }: Dependencies,
): Promise<ProjectShareUrlsVM> {
  const projectLocation = new EntryLocation(projectPath);
  const project = Project.fromLocation(projectLocation);

  const files = await listEntries(projectLocation, 'file');

  const result: ProjectShareUrlsVM = {
    original: undefined,
    edits: [],
  };

  for (const file of files) {
    if (Clip.isClip(file)) {
      const clip = new Clip(file);

      const sharePath = await getSharePath(file);
      const urlName = `${project.id}-${file.getFolder()}`;
      const shortUrl = await getShortUrl(urlName, sharePath);
      const shareVm = { name: clip.name, url: shortUrl } as ShareUrlVM;

      if (clip.isOriginal()) {
        result.original = shareVm;
      } else {
        result.edits.push({ ...shareVm });
      }
    }
  }

  return result;
}
