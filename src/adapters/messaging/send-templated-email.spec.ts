import setupAwsMocks from '../../utils/tests/aws/setup-aws-mocks';
import { sendTemplatedEmail } from './send-templated-email';

describe('send email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAwsMocks();
  });

  it('sends the email', async () => {
    const result = await sendTemplatedEmail(
      ['raguy1143@gmail.com'],
      'video-ready',
      JSON.stringify({ firstName: 'test', lastName: 'test' }),
    );

    expect(!!result).toBe(true);
  });
});
