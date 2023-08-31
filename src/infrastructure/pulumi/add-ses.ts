import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

/* istanbul ignore file */

export default function addSes(mainDomainDnsZone: aws.route53.Zone): void {
  const config = new pulumi.Config();
  const emailDomain = config.require('ses_email_domain');

  const domainIdentity = new aws.ses.DomainIdentity(`ses-identity`, {
    domain: emailDomain,
  });

  new aws.ses.DomainIdentityVerification(`ses-verification`, { domain: domainIdentity.id });

  const domainDKIM = new aws.ses.DomainDkim(`ses-domain-dkim`, {
    domain: emailDomain,
  });
  const dkimRecords: aws.route53.Record[] = [];
  const dkimRecordCount = 3;

  for (let i = 0; i < dkimRecordCount; i++) {
    const token = domainDKIM.dkimTokens[i].apply((t) => `${t}.dkim.amazonses.com`);
    const name = domainDKIM.dkimTokens[i].apply((t) => `${t}._domainkey.${emailDomain}`);

    const dkimRecord = new aws.route53.Record(`${emailDomain}-dkim-record-${i + 1}`, {
      zoneId: mainDomainDnsZone.zoneId,
      name,
      type: 'CNAME',
      ttl: 36000,
      records: [token],
    });

    dkimRecords.push(dkimRecord);
  }

  new aws.ses.Template('NotificationTemplate', {
    subject: 'Greetings!',
    name: 'NotificationTemplate',
    html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta name="viewport" content="width=device-width"/> <title>Eos email</title> <style>.link{letter-spacing: 0.02em; color: #7a7a7a; text-transform: uppercase; text-decoration: underline;}a:hover{opacity: 0.8;}p{line-height: 1.5em;}button:hover{opacity: 0.9;}</style></head><body style=" padding: 0; margin: 0; font-family: \'Poppins\', sans-serif; background-color: silver; "> <table class="container frame-1" style=" width: 600px; margin: 0 auto; background-color: white; padding: 24px 60px; " width="600" bgcolor="white"> <tr> <td width="140"> <img src="https://ik.imagekit.io/giangpham/EditOnTheSpot/logo.png?updatedAt=1678608357030" alt style="width: 100%"/> </td><td align="right"> <a href="{{websiteUrl}}" class="link" style=" letter-spacing: 0.02em; color: #7a7a7a; text-transform: uppercase; text-decoration: underline; ">View In Browser</a> </td></tr></table> <table class="container frame-2" style=" width: 600px; margin: 0 auto; background-color: white; padding-top: 32px; padding-bottom: 16px; " width="600" bgcolor="white"> <tr> <td align="center"> <span class="title red" style=" color: #d92027; font-weight: 700; font-size: 40px; position: relative; z-index: 2; ">Congratulations!</span> </td></tr><tr> <td align="center" style="padding-top: 1.5rem"> <span class="subtitle" style="font-size: 16px; color: black">YOUR VIDEOS ARE READY</span> </td></tr></table> <table class="container frame-3" style=" width: 600px; margin: 0 auto; background-color: white; padding-bottom: 16px; " width="600" bgcolor="white"> <tr> <td> <img src="https://ik.imagekit.io/giangpham/EditOnTheSpot/frame_1.png?updatedAt=1678608357042" alt style="width: 100%"/> </td></tr></table> <table class="container frame-4" style=" width: 600px; margin: 0 auto; background-color: white; padding: 0 60px 32px 60px; " width="600" bgcolor="white"> <tr> <td align="center"> <p style="font-size: 16px; color: #7a7a7a"> The amazing video that you just recorded is already edited, automatically, done for you! </p><p style="font-size: 16px; color: #7a7a7a"> You can download and amend your clips in the Project Library. </p></td></tr><tr> <td align="center"> <a href="{{accountLink}}"> <button class="button-sm" style=" background: #d92027; border-radius: 1000px; color: white; border: 0; cursor: pointer; padding: 20px 24px; "> GO TO MY PROJECT LIBRARY </button></a> </td></tr></table> <table class="container footer" style=" width: 600px; margin: 0 auto; background-color: #d92027; padding: 32px 200px 20px; " width="600" bgcolor="#d92027"> <tr> <td align="center"> <a href="#"> <img src="https://ik.imagekit.io/giangpham/EditOnTheSpot/tw.png?updatedAt=1678608357191" alt style="width: 20px" width="20"/> </a> </td><td align="center"> <a href="#"> <img src="https://ik.imagekit.io/giangpham/EditOnTheSpot/fb-1.png?updatedAt=1678608356836" alt style="width: 20px" width="20"/> </a> </td><td align="center"> <a href="#"> <img src="https://ik.imagekit.io/giangpham/EditOnTheSpot/ig.png?updatedAt=1678608357009" alt style="width: 20px" width="20"/> </a> </td><td align="center"> <a href="#"> <img src="https://ik.imagekit.io/giangpham/EditOnTheSpot/ln.png?updatedAt=1678608357000" alt style="width: 20px" width="20"/> </a> </td></tr></table> <table class="container footer" style=" width: 600px; margin: 0 auto; background-color: #d92027; padding-bottom: 16px; " width="600" bgcolor="#d92027"> <tr> <td align="center"> <a href="{{websiteUrl}}" class="white" style="color: white; font-size: 16px">{{websiteUrl}}</a> </td></tr><tr align="center"> <td class="white" style="color: white; font-size: 10px"> © Copyright Edit on the Spot 2022 </td></tr></table> <table class="container footer" style=" width: 600px; margin: 0 auto; background-color: #d92027; padding-bottom: 26px; " width="600" bgcolor="#d92027"> <tr> <td align="center"> <img src="https://ik.imagekit.io/giangpham/EditOnTheSpot/logo-round.png?updatedAt=1678608356805" style="width: 56px" alt width="56"/> </td></tr></table></body></html>',
  });
}
