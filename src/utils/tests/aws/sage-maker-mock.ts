export default class SageMakerMock {
  createProcessingJob = (): unknown => {
    return { promise: () => Promise.resolve() };
  };
}
