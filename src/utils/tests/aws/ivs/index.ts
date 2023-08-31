export class IvsClientMock {
  private _throwError = false;
  private _commandData: { [key: string]: unknown } = {};

  setError = ({ isError }: { command?: unknown; isError: boolean }): void => {
    this._throwError = isError;
  };

  setData = (data: { [key: string]: any }): void => {
    this._commandData = {
      ...data,
      ...this._commandData,
    };

    console.log(this._commandData, 'test');
  };

  send = (test: unknown): unknown => {
    const data = {};

    if (test instanceof GetChannelCommandMock) {
      return (
        this._commandData[test.constructor.name] ?? {
          channel: {
            playbackUrl: 'default test playback',
            ingestEndpoint: 'default test ingest point',
          },
        }
      );
    }

    console.log(test);
    if (test instanceof CreateChannelCommandMock) {
      if (this._throwError) {
        return Promise.reject();
      }
      return Promise.resolve();
    }

    if (test instanceof ListChannelsCommandMock) {
      if (this._throwError) {
        return Promise.reject();
      }

      return (
        this._commandData[test.constructor.name] ?? {
          channels: [{ arn: 'arn from mock' }],
        }
      );
    }

    if (test instanceof GetStreamKeyCommandMock) {
      return (
        this._commandData[test.constructor.name] ?? {
          streamKey: {
            value: 'default streamkey',
          },
        }
      );
    }

    if (test instanceof ListStreamKeysCommandMock) {
      return (
        this._commandData[test.constructor.name] ?? {
          streamKeys: [
            {
              arn: 'Default arn key',
            },
          ],
        }
      );
    }
    return data;
  };
}
export class CreateChannelCommandMock {}
export class GetChannelCommandMock {}
export class ListChannelsCommandMock {}
export class GetStreamKeyCommandMock {}
export class ListStreamKeysCommandMock {}
