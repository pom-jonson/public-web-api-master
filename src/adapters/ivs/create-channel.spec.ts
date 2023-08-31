import setupIvsMocks, { IVsMocks } from '../../utils/tests/aws/ivs/setup-ivs-mock';
import { createChannel } from './create-channel';
describe('create channel', () => {
  let ivsMocks: IVsMocks;
  beforeEach(() => {
    ivsMocks = setupIvsMocks();
  });

  it('should return the correct response', () => {
    expect(createChannel('testid')).resolves.not.toThrow();
  });

  it('should throw error', () => {
    ivsMocks.IvsClientMock.setError({ isError: true });
    expect(createChannel('testId')).rejects.toBeFalsy();
  });
});
