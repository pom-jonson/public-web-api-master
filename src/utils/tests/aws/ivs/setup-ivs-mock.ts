import {
  CreateChannelCommandMock,
  GetChannelCommandMock,
  GetStreamKeyCommandMock,
  IvsClientMock,
  ListChannelsCommandMock,
  ListStreamKeysCommandMock,
} from '.';
import {
  CreateChannelCommand,
  GetChannelCommand,
  GetStreamKeyCommand,
  IvsClient,
  ListChannelsCommand,
  ListStreamKeysCommand,
} from '@aws-sdk/client-ivs';

export default function setupAwsMocks(): IVsMocks {
  const ivsMocks = new IVsMocks();

  (IvsClient as unknown as jest.Mock).mockReturnValue(ivsMocks.IvsClientMock);
  (CreateChannelCommand as unknown as jest.Mock).mockReturnValue(ivsMocks.createChannelCommandMock);
  (GetChannelCommand as unknown as jest.Mock).mockReturnValue(ivsMocks.getChannelCommandmock);
  (GetStreamKeyCommand as unknown as jest.Mock).mockReturnValue(ivsMocks.getStreamKeyCommandMock);
  (IvsClient as unknown as jest.Mock).mockReturnValue(ivsMocks.IvsClientMock);
  (ListChannelsCommand as unknown as jest.Mock).mockReturnValue(ivsMocks.listChannelsCommandMock);
  (ListStreamKeysCommand as unknown as jest.Mock).mockReturnValue(
    ivsMocks.listStreamKeysCommandMock,
  );

  return ivsMocks;
}

export class IVsMocks {
  createChannelCommandMock = new CreateChannelCommandMock();
  getChannelCommandmock = new GetChannelCommandMock();
  getStreamKeyCommandMock = new GetStreamKeyCommandMock();
  IvsClientMock = new IvsClientMock();
  listChannelsCommandMock = new ListChannelsCommandMock();
  listStreamKeysCommandMock = new ListStreamKeysCommandMock();
}
