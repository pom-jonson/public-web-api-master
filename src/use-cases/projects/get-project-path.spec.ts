import EntryLocation, { EntryType } from '../../entities/entry-location';
import { InvalidParameterError, NotFoundError, UnexpectedError } from '../exceptions';
import getProjectPath, { Dependencies } from './get-project-path';

describe('get project path', () => {
  const customerEmail = 'test@mail.com';
  const id = 'k1p4na';
  const accountBucketPrefix = 'alloha';

  const getMockDeps = (params?: Partial<{ folders: EntryLocation[] }>): Dependencies => {
    return {
      bucket: accountBucketPrefix,
      listEntries: (_: EntryLocation, entryType: EntryType) => {
        return Promise.resolve(entryType === 'folder' ? params?.folders : []);
      },
    };
  };

  [undefined, null, ''].forEach((customerEmail) => {
    it('throws if customer email is not passed', () => {
      expect(
        getProjectPath(
          {
            customerEmail,
            id,
          },
          getMockDeps(),
        ),
      ).rejects.toThrowError(
        InvalidParameterError.withGenericMessage('customerEmail', customerEmail),
      );
    });
  });

  [undefined, null, ''].forEach((id) => {
    it('throws if id is not passed', () => {
      expect(
        getProjectPath(
          {
            customerEmail,
            id,
          },
          getMockDeps(),
        ),
      ).rejects.toThrowError(InvalidParameterError.withGenericMessage('id', id));
    });
  });

  [undefined, []].forEach((folders) => {
    it('throws if project folder cannot be found', () => {
      expect(
        getProjectPath(
          {
            customerEmail,
            id,
          },
          getMockDeps({ folders }),
        ),
      ).rejects.toThrowError(new NotFoundError(id));
    });
  });

  it('throws if multiple project folders found', () => {
    const folders = [
      new EntryLocation(`projects/${id}-processed-on-zoom-2005-01-01-02-54`),
      new EntryLocation(`projects/${id}-processed-on-skype-2022-03-17-22-06`),
    ];

    expect(
      getProjectPath(
        {
          customerEmail,
          id,
        },
        getMockDeps({ folders }),
      ),
    ).rejects.toThrowError(new UnexpectedError(`Ambiguous project id '${id}'`));
  });

  it('returns project path when it can be found', async () => {
    const folders = [new EntryLocation(`projects/${id}-processed-on-zoom-2005-03-03-12-54`)];

    const result = await getProjectPath({ customerEmail, id }, getMockDeps({ folders }));

    expect(result).toContain(`projects/${id}-processed-on-zoom-2005-03-03-12-54`);
  });
});
