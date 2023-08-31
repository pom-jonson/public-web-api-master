import * as AWS from 'aws-sdk';

/* istanbul ignore file */

export default class EcsMock {
  tasksParams: unknown[] = [];

  runTask = (params: AWS.ECS.RunTaskRequest): unknown => {
    if (params) {
      this.tasksParams.push(params);
    }
    return { promise: () => Promise.resolve(null) };
  };
}
