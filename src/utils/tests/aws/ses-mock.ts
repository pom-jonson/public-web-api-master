export default class SesMock {
  sendTemplatedEmail = (): unknown => {
    return { promise: () => Promise.resolve({ MessageId: Math.random().toString() }) };
  };
}
