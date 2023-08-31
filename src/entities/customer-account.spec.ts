import CustomerAccount from './customer-account';
import EntryLocation from './entry-location';

describe('customer account', () => {
  [
    {
      bucket: `prefix-account`,
      accountId: 'account',
    },
    {
      bucket: `anotherprefix-long-account-name`,
      accountId: 'long-account-name',
    },
  ].forEach(({ bucket, accountId }) => {
    it('initializes correctly from location', () => {
      const result = CustomerAccount.fromBucketAndAccountId(bucket, accountId);
      expect(result).toMatchObject({
        accountId,
        location: new EntryLocation(`${bucket}/${accountId}`),
      });
    });
  });

  it('creates correctly from prefix and account id', () => {
    const bucket = 'bucket';
    const accountId = 'some-account';
    const result = new CustomerAccount(bucket, accountId);

    expect(result).toMatchObject({
      accountId,
      location: new EntryLocation('bucket/some-account'),
    });
  });

  it('creates correct projects location', () => {
    const customerAccount = new CustomerAccount('smth', 'some-account');
    expect(customerAccount.getProjectsLocation()).toEqual(
      new EntryLocation('smth/some-account/projects'),
    );
  });

  it('creates correct assets location', () => {
    const customerAccount = new CustomerAccount('pref', 'account');
    expect(customerAccount.getAssetsLocation()).toEqual(new EntryLocation('pref/account/assets'));
  });

  it('creates the correct credential location', () => {
    const customerAccount = new CustomerAccount('john', 'account');
    expect(customerAccount.getCredentialsLocation()).toEqual(
      new EntryLocation('john/account/credentials'),
    );
  });
});
