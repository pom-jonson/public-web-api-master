/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
jest.mock('aws-sdk', () => ({
  config: jest.requireActual('aws-sdk').config,
  S3: jest.fn(),
  SES: jest.fn(),
  MediaConvert: jest.fn(),
  TranscribeService: jest.fn(),
  SageMaker: jest.fn(),
  CloudWatchEvents: jest.fn(),
  ECS: jest.fn(),
}));

jest.mock('@deepgram/sdk', () => ({
  Deepgram: jest.fn(),
}));

jest.mock('@aws-sdk/client-ivs', () => ({
  IvsClient: jest.fn(),
  CreateChannelCommand: jest.fn(),
  GetChannelCommand: jest.fn(),
  ListChannelsCommand: jest.fn(),
  GetStreamKeyCommand: jest.fn(),
  ListStreamKeysCommand: jest.fn(),
}));

jest.mock('../../../src/controllers/middleware/auth/authenticate', () => ({
  authenticate: jest.fn(() => ({ email: 'test@test.com' })),
  authenticateWebhook: jest.fn(),
}));
