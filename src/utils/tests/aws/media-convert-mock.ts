export default class MediaConvertMock {
  createJob = (): unknown => {
    return { promise: () => Promise.resolve({ Job: { Id: '1644997249934-6lbo8u' } }) };
  };
}
