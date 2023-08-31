/* eslint-disable @typescript-eslint/no-unused-vars */
import VideoEdit, { VideoEditProps } from './video-edit';
import EntryLocation from './entry-location';

describe('video edit', () => {
  it('initializes correctly', () => {
    const props: VideoEditProps = {
      name: 'some name',
      type: 'top-and-tail',
      status: 'Processing',
      timing: { start: 10, end: 20 },
      lastModifiedDate: new Date('2022-01-01'),
    };
    props.history = [{ type: 'top-and-tail', timing: { start: 5, end: 8 } }];
    const result = new VideoEdit(props);

    expect(result).toEqual(props);
  });

  it('sets defaults if props are not passed', () => {
    const result = new VideoEdit({ type: 'top-and-tail', timing: { start: 10, end: 20 } });

    expect(result.name).toBe('Top And Tail');
    expect(result.status).toBe('InReview');
    expect(result.lastModifiedDate.valueOf()).toBeCloseTo(new Date().valueOf(), -2);
    expect(result.history).toStrictEqual([]);
  });

  [
    { path: 'bucket/folder/timestamps.json', expectedResult: true },
    { path: 'bucket/folder', expectedResult: false },
    { path: 'bucket/folder/timing.txt', expectedResult: false },
  ].forEach(({ path, expectedResult }) => {
    it('finds out if file is timing correctly', () => {
      const result = VideoEdit.isTiming(new EntryLocation(path));
      expect(result).toEqual(expectedResult);
    });
  });

  [
    { path: 'bucket/folder/edit.json', expectedResult: true },
    { path: 'bucket/folder', expectedResult: false },
    { path: 'bucket/folder/edit.txt', expectedResult: false },
  ].forEach(({ path, expectedResult }) => {
    it('finds out if file is video edit correctly', () => {
      const result = VideoEdit.isEdit(new EntryLocation(path));
      expect(result).toEqual(expectedResult);
    });
  });

  it('updates props and pushes previous version to history', () => {
    const videoEdit = new VideoEdit({ type: 'top-and-tail', timing: { start: 1, end: 2 } });

    const result = videoEdit.update({ status: 'Processing', timing: { start: 3, end: 4 } });

    const { history, ...rest } = videoEdit;
    expect(result).toEqual({
      name: 'Top And Tail',
      type: 'top-and-tail',
      status: 'Processing',
      timing: { start: 3, end: 4 },
      lastModifiedDate: expect.any(Date) as Date,
      history: [rest],
    } as VideoEdit);
  });

  it('adds 2nd version to history array correctly', () => {
    const videoEdit1 = new VideoEdit({ type: 'top-and-tail', timing: { start: 1, end: 2 } });

    const videoEdit2 = videoEdit1.update({ status: 'Processing', timing: { start: 3, end: 4 } });
    const result = videoEdit2.update({ status: 'Processed', timing: { start: 5, end: 6 } });

    const { history: history1, ...rest1 } = videoEdit1;
    const { history: history2, ...rest2 } = videoEdit2;
    expect(result).toEqual({
      name: 'Top And Tail',
      type: 'top-and-tail',
      status: 'Processed',
      timing: { start: 5, end: 6 },
      lastModifiedDate: expect.any(Date) as Date,
      history: [rest1, rest2],
    });
  });
});
