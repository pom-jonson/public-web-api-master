import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import { CreateChannelOutput } from '../../adapters/ivs/create-channel';
import CustomerAccount from '../../entities/customer-account';

interface Dependencies {
  getChannelArn(id: string): Promise<string | undefined>;
  createChannel(id: string): Promise<CreateChannelOutput>;
  normalizeString(
    source: string,
    stringToreplace: string,
    replaceWith: string,
    capitalize?: boolean,
  ): string;
  putObject(objectPath: string, objectBuffer: Buffer): Promise<void>;
}

export interface CreateUserChannelInput {
  email: string;
}

export interface CreateUserChannelOutput {
  id: string;
}

interface Email {
  email: string;
}
export default async function setUpUser(
  { email }: CreateUserChannelInput,
  { normalizeString, getChannelArn, createChannel, putObject }: Dependencies,
): Promise<CreateUserChannelOutput> {
  const normalizedEmail = normalizeString(email, '@.', '-');

  if (!(await getChannelArn(normalizedEmail))) {
    const creatChannelResp = await createChannel(normalizedEmail);
    console.log(creatChannelResp);

    const customer = CustomerAccount.fromBucketAndAccountId(GET_PROJECT_BUCKET(), normalizedEmail);
    const putEmailFileResp = await putObject(
      `${customer.getCredentialsLocation().getFolderPath()}/${normalizedEmail}.json`,
      Buffer.from(JSON.stringify({ email } as Email)),
    );
    console.log(putEmailFileResp);
  }

  return {
    id: normalizedEmail,
  };
}
