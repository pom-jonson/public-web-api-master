import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

/* istanbul ignore file */

export default function getMainDomainDnsZone(): aws.route53.Zone {
  const config = new pulumi.Config();
  const zoneId = config.get('main_domain_zone_id');

  return zoneId ? aws.route53.Zone.get('main-domain-dns-zone', zoneId) : null;
}
