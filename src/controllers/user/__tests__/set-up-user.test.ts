import setupIvsMocks from '../../../utils/tests/aws/ivs/setup-ivs-mock';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { setUpUserCallback } from '../set-up-user';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import { CreateUserChannelOutput } from '../../../use-cases/users/set-user';
describe('setup user account', () => {
  beforeEach(() => {
    setupIvsMocks();
  });

  it('returns stream keys of the user', async () => {
    const result = await setUpUserCallback({
      body: JSON.stringify({ email: 'test@gmail.com' }),
    } as unknown as APIGatewayProxyEvent);
    const res = JSON.parse(result.body) as CreateUserChannelOutput;

    expectStatusCodeWithStandardHeaders(result, 200);
    expect(res.id).toBe('test-gmail-com');
  });
});
