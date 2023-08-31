import { InvalidParameterError } from '../exceptions';
import updateProject, { Dependencies } from './update-project';

describe('update project', () => {
  const id = 'akwp4o';
  const name = 'nice name';

  const getMockDeps = (): Dependencies => {
    return {
      putSerializedObject: () => Promise.resolve(),
    };
  };

  [undefined, null, ''].forEach((projectPath) => {
    it('throws if project path is not passed', () => {
      expect(
        updateProject(
          {
            projectPath,
            name: 'projectPath',
          },
          getMockDeps(),
        ),
      ).rejects.toThrowError(InvalidParameterError.withGenericMessage('projectPath', projectPath));
    });
  });

  [undefined, null, ''].forEach((name) => {
    it('throws if name is not passed', () => {
      expect(
        updateProject(
          {
            projectPath: 'path',
            name,
          },
          getMockDeps(),
        ),
      ).rejects.toThrowError(InvalidParameterError.withGenericMessage('name', name));
    });
  });

  it('returns true when existing and new name dont match', async () => {
    const { result } = await updateProject(
      { projectPath: `projects/${id}-processed-on-zoom-2005-03-03-12-54`, name },
      getMockDeps(),
    );
    expect(result).toBeTruthy();
  });

  it('returns false when existing and new name match', async () => {
    const { result } = await updateProject(
      { projectPath: `projects/${id}-${name}-2005-03-03-12-54`, name },
      getMockDeps(),
    );
    expect(result).toBeFalsy();
  });
});
