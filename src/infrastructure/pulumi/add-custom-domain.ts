import * as aws from '@pulumi/aws';
import * as apigateway from '@pulumi/aws-apigateway';
import * as pulumi from '@pulumi/pulumi';

/* istanbul ignore file */

export default function addCustomDomain(
  api: apigateway.RestAPI,
  mainDomainDnsZone: aws.route53.Zone,
): void {
  const config = new pulumi.Config();
  const apiDomainName = config.get('api_custom_domain');

  if (!apiDomainName) {
    return;
  }

  // Create a DNS zone for our custom domain.
  const apiDnsZone = new aws.route53.Zone('api-dns-zone', {
    name: apiDomainName,
  });

  // Provision an SSL certificate to enable SSL -- ensuring to do so in us-east-1.
  const provider = new aws.Provider('provider', { region: 'us-east-1' });
  const sslCert = new aws.acm.Certificate(
    'api-ssl-cert',
    {
      domainName: apiDomainName,
      validationMethod: 'DNS',
    },
    { provider: provider },
  );

  // Create the necessary DNS records for ACM to validate ownership, and wait for it.
  const sslCertValidationRecord = new aws.route53.Record('api-ssl-cert-validation-record', {
    zoneId: apiDnsZone.id,
    name: sslCert.domainValidationOptions[0].resourceRecordName,
    type: sslCert.domainValidationOptions[0].resourceRecordType,
    records: [sslCert.domainValidationOptions[0].resourceRecordValue],
    ttl: 10 * 60 /* 10 minutes */,
  });
  const sslCertValidationIssued = new aws.acm.CertificateValidation(
    'api-ssl-cert-validation-issued',
    {
      certificateArn: sslCert.arn,
      validationRecordFqdns: [sslCertValidationRecord.fqdn],
    },
    { provider: provider },
  );

  // Configure an edge-optimized domain for our API Gateway, leveraging. This will configure
  // a Cloudfront CDN distribution behind the scenes and serve our API Gateway at a custom
  // domain name over SSL.
  const apiDomain = new aws.apigateway.DomainName('api-domain', {
    certificateArn: sslCertValidationIssued.certificateArn,
    domainName: apiDomainName,
  });

  new aws.apigateway.BasePathMapping('api-domain-mapping', {
    restApi: api.api.id,
    stageName: api.stage.stageName,
    domainName: apiDomain.id,
  });

  const subdomainNsRecord = new aws.route53.Record('api-subdomain', {
    name: apiDomainName,
    type: 'NS',
    zoneId: mainDomainDnsZone.zoneId,
    ttl: 36000,
    records: apiDnsZone.nameServers,
  });

  // Now, create an A record for our domain that directs to the allocated CloudFront distribution.
  new aws.route53.Record(
    'api-dns-record',
    {
      name: apiDomain.domainName,
      type: 'A',
      zoneId: apiDnsZone.id,
      aliases: [
        {
          evaluateTargetHealth: true,
          name: apiDomain.cloudfrontDomainName,
          zoneId: apiDomain.cloudfrontZoneId,
        },
      ],
    },
    { dependsOn: [subdomainNsRecord, sslCertValidationIssued] },
  );
}
