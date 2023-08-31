import InvalidRequestError from '../../controllers/middleware/invalid-request-error';
import EntryLocation from '../../entities/entry-location';

interface EcsStoppedEvent {
  timestampFilePath: string;
}

interface EcsEvent {
  detail: {
    overrides: {
      containerOverrides: [
        {
          command: string[];
        },
      ];
    };
  };
}

export function parseEcsTopAndTailAiTaskEvent(rawEvent: unknown): EcsStoppedEvent {
  const event = rawEvent as EcsEvent;
  if (
    !event.detail?.overrides?.containerOverrides[0]?.command ||
    event.detail.overrides.containerOverrides[0].command.length == 0
  ) {
    throw new InvalidRequestError('ECS event could not be parsed.');
  }
  var timestampFilePath: string;
  event.detail.overrides.containerOverrides[0].command.forEach((command) => {
    if (command.endsWith('timestamps.json')) {
      timestampFilePath = command;
    }
  });
  if (!timestampFilePath) {
    throw new InvalidRequestError('Timestamp json file is not found.');
  }
  return {
    timestampFilePath: timestampFilePath,
  };
}
