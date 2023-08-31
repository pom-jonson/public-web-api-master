import * as aws from '@pulumi/aws';
/* istanbul ignore file */

export function addProjectDatabase(): void {
  const name = 'project';
  new aws.dynamodb.Table(name, {
    name: name,
    deletionProtectionEnabled: true,
    attributes: [
      {
        name: 'PK',
        type: 'S',
      },
      {
        name: 'SK',
        type: 'S',
      },
    ],
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'PK',
    rangeKey: 'SK',
    tags: {
      Name: 'project',
    },
  });
}

export function addAssetDatabase(): void {
  const name = 'asset';
  new aws.dynamodb.Table(name, {
    name: name,
    deletionProtectionEnabled: true,
    attributes: [
      {
        name: 'PK',
        type: 'S',
      },
    ],
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'PK',
    tags: {
      Name: name,
    },
  });
}
