import EntryLocation from './entry-location';
import Project from './project';

describe('project', () => {
  it('throws for incorrect path', () => {
    const location = new EntryLocation('some/path/2021-12-17-1-12');
    expect(() => Project.fromLocation(location)).toThrowError();
  });

  [
    {
      path: 'some/path/8ghmpa-2021-12-17-1-12',
      id: '8ghmpa',
      name: '',
      created: new Date('2021-12-17 01:12'),
    },
    {
      path: 'another/path/l01pavcqw-project-2020-03-20-15-41',
      id: 'l01pavcqw',
      name: 'Project',
      created: new Date('2020-03-20 15:41'),
    },
  ].forEach(({ path, id, name, created }) => {
    it('initializes from path correctly', () => {
      const location = new EntryLocation(path);
      const result = Project.fromLocation(location);

      expect(result).toMatchObject({ id, name, created });
    });
  });

  it('creates from parts of path correctly', () => {
    const location = new EntryLocation('some/path');
    const created = new Date('2022-02-17 22:10');
    const result = new Project(location, 'ka26w1', 'I am project', created);

    expect(result).toMatchObject({
      id: 'ka26w1',
      name: 'I Am Project',
      created,
      location: new EntryLocation('some/path/ka26w1-i-am-project-2022-02-17-22-10'),
    });
  });

  it('creates correct new project', () => {
    const created = new Date('2022-02-17 19:30');
    const result = Project.createNew(new EntryLocation('bucket'), 'recorded-on-Something', created);

    expect(result).toMatchObject({ name: 'Recorded On Something', created });
    expect(result.location.getFullPath()).toBe(
      `bucket/${result.id}-recorded-on-something-2022-02-17-19-30`,
    );
  });

  it('returns correct clips location', () => {
    const project = new Project(
      new EntryLocation('bucket'),
      '123',
      'proj',
      new Date('2021-01-01 12:00'),
    );
    expect(project.getClipsLocation()).toEqual(
      new EntryLocation('bucket/123-proj-2021-01-01-12-00/processed'),
    );
  });

  it('renames correctly', () => {
    const project = new Project(
      new EntryLocation('bucket'),
      '152kas',
      'projectos',
      new Date('2021-11-01 10:23'),
    );

    const result = project.rename('project X');
    expect(result).toStrictEqual(
      new Project(new EntryLocation('bucket'), '152kas', 'Project X', new Date('2021-11-01 10:23')),
    );
  });
});
