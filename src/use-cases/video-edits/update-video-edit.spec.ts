import Timing from '../../entities/timing';
import { VideoEditingStatus } from '../../entities/video-edit';
import { InvalidParameterError } from '../exceptions';
import updateVideoEdit, { Dependencies } from './update-video-edit';

describe('update video edit', () => {
  const getMockDeps = (): Dependencies => {
    return {
      putSerializedObject: () => Promise.resolve(),
    };
  };

  [undefined, null, ''].forEach((folderPath) => {
    it('throws if folder path is not passed', () => {
      expect(
        updateVideoEdit(
          {
            folderPath,
            status: 'InReview',
            timing: { start: 1, end: 2 },
          },
          getMockDeps(),
        ),
      ).rejects.toThrowError(InvalidParameterError.withGenericMessage('folderPath', folderPath));
    });
  });

  [undefined, null, ''].forEach((status) => {
    it('throws if status is not passed', () => {
      expect(
        updateVideoEdit(
          {
            folderPath: 'path',
            status: status as VideoEditingStatus,
            timing: { start: 1, end: 2 },
          },
          getMockDeps(),
        ),
      ).rejects.toThrowError(InvalidParameterError.withGenericMessage('status', status));
    });
  });

  [undefined, null].forEach((timing) => {
    it('throws if timing is not passed', () => {
      expect(
        updateVideoEdit(
          {
            folderPath: 'path',
            status: 'InReview',
            timing: timing as Timing,
          },
          getMockDeps(),
        ),
      ).rejects.toThrowError(InvalidParameterError.withGenericMessage('timing', timing));
    });
  });

  it('returns result with passed status and timing', async () => {
    const result = await updateVideoEdit(
      {
        folderPath: 'bucket/project/top-and-tail/edit.json',
        status: 'InReview',
        timing: { start: 12, end: 31 },
      },
      getMockDeps(),
    );

    expect(result).toMatchObject({
      type: 'top-and-tail',
      status: 'InReview',
      timing: { start: 12, end: 31 },
    });
  });
});
