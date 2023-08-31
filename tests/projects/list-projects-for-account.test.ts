import { defineFeature, loadFeature } from 'jest-cucumber';
import superagent from 'superagent';
import { ListProjectVM } from '../../src/use-cases/projects/list-projects';

const feature = loadFeature('./tests/projects/list-projects-for-account.feature');

defineFeature(feature, (test) => {
  jest.setTimeout(20000);

  const url = 'https://laolct6mhj.execute-api.us-west-2.amazonaws.com/stage';

  test('List projects happy path', ({ given, when, then, and }) => {
    let myAccountId: string;
    let result: superagent.Response;
    let projects: ListProjectVM[];

    given(/^that my account id is "(.*)"$/, (accountId: string) => {
      myAccountId = accountId;
    });

    when('I send a request to list my projects', async () => {
      result = await superagent.get(`${url}/${myAccountId}/projects`);
    });

    then('I receive 1 or more projects', () => {
      expect(result.status).toBe(200);
      projects = result.body as ListProjectVM[];
      expect(projects.length).toBeGreaterThanOrEqual(1);
    });

    and('every project has id', () => {
      expect(projects.every((pr) => !!pr.id)).toBeTruthy();
    });
  });
});
