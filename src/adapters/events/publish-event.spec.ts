import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import publishEvent from './publish-event';

describe('publish event', () => {
  let awsMocks: AwsMocks;

  beforeEach(() => {
    awsMocks = setupAwsMocks();
  });

  it('creates correct editing type and body', () => {
    publishEvent('edit-clip-top-and-tail', { some: 'body' });

    expect(awsMocks.cloudWatchEventsMock.rawEvents.pop()).toStrictEqual({
      Detail: '{"eventType":[{"prefix":"edit-clip-top-and-tail"}],"some":"body"}',
    });
  });
});
