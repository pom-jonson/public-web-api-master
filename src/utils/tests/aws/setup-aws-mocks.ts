import {
  MediaConvert,
  SageMaker,
  S3,
  TranscribeService,
  CloudWatchEvents,
  SES,
  ECS,
} from 'aws-sdk';
import CloudWatchEventsMock from './cloud-watch-events-mock';
import MediaConvertMock from './media-convert-mock';
import S3Mock from './s3-mock';
import SageMakerMock from './sage-maker-mock';
import TranscribeMock from './transcribe-mock';
import SesMock from './ses-mock';
import EcsMock from './ecs-mock';
/* istanbul ignore file */

export default function setupAwsMocks(): AwsMocks {
  const awsMocks = new AwsMocks();

  (S3 as unknown as jest.Mock).mockReturnValue(awsMocks.s3);
  (MediaConvert as unknown as jest.Mock).mockReturnValue(awsMocks.mediaConvert);
  (TranscribeService as unknown as jest.Mock).mockReturnValue(awsMocks.transcribeMock);
  (SageMaker as unknown as jest.Mock).mockReturnValue(awsMocks.sageMakerMock);
  (CloudWatchEvents as unknown as jest.Mock).mockReturnValue(awsMocks.cloudWatchEventsMock);
  (SES as unknown as jest.Mock).mockReturnValue(awsMocks.ses);
  (ECS as unknown as jest.Mock).mockReturnValue(awsMocks.ecs);

  return awsMocks;
}

export class AwsMocks {
  s3 = new S3Mock();
  ses = new SesMock();
  ecs = new EcsMock();
  mediaConvert = new MediaConvertMock();
  transcribeMock = new TranscribeMock();
  sageMakerMock = new SageMakerMock();
  cloudWatchEventsMock = new CloudWatchEventsMock();
  ecsMock = new EcsMock();
}
