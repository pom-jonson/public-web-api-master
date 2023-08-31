import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import {
  GET_AUTH0_API_AUDIENCE,
  GET_AUTH0_CLIENT_ID,
  GET_AUTH0_ISSUER,
  GET_AUTH0_JWKS_URI,
  GET_WEBHOOK_API_KEY,
} from '../../../../runtime-config';
import Identity from './identity';
import UnauthorizedError from './unauthorized-error';

/* istanbul ignore file */

export const authenticate = async (headers: APIGatewayProxyEventHeaders): Promise<Identity> => {
  const authToken = getToken(headers, 'Authorization', 'Bearer');
  await verifyToken(authToken, GET_AUTH0_API_AUDIENCE());

  const idToken = getToken(headers, 'Identity', 'Token');
  const tokenPayload = await verifyToken(idToken, GET_AUTH0_CLIENT_ID());

  return tokenPayload as Identity;
};

export const authenticateWebhook = (headers: APIGatewayProxyEventHeaders): void => {
  const authToken = getApiKey(headers, 'Authorization');

  if (authToken !== GET_WEBHOOK_API_KEY()) {
    throw new UnauthorizedError(`Invalid API Key provided.`);
  }
};

function getApiKey(headers: APIGatewayProxyEventHeaders, headerKey: string): string {
  if (!headers || !headers[headerKey]) {
    throw new UnauthorizedError(`Expected ${headerKey} header to be provided.`);
  }

  return headers[headerKey];
}
// Check the Token is valid with Auth0
const verifyToken = async (token: string, audience: string): Promise<jwt.JwtPayload> => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header || !decoded.header.kid) {
    throw new UnauthorizedError('invalid token');
  }

  const client = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10, // Default value
    jwksUri: GET_AUTH0_JWKS_URI(),
  });

  const key = await client.getSigningKey(decoded.header.kid);
  const signingKey = key.getPublicKey();
  if (!signingKey) {
    throw new UnauthorizedError('could not get signing key');
  }

  try {
    const verifiedJWT = jwt.verify(token, signingKey, {
      audience: audience,
      issuer: GET_AUTH0_ISSUER(),
      algorithms: ['RS256'],
    });

    if (!verifiedJWT || typeof verifiedJWT === 'string' || !isVerifiedJWT(verifiedJWT)) {
      throw new UnauthorizedError('could not verify JWT');
    }

    return verifiedJWT;
  } catch (e) {
    if (e instanceof Error) {
      throw new UnauthorizedError(e.message);
    }
    throw e;
  }
};

// Extract and return the Bearer Token from the Lambda event parameters
function getToken(
  headers: APIGatewayProxyEventHeaders,
  headerKey: string,
  headerValuePrefix: string,
): string {
  if (!headers || !headers[headerKey]) {
    throw new UnauthorizedError(`Expected ${headerKey} header to be provided.`);
  }

  const tokenString = headers[headerKey];
  const match = tokenString.match(new RegExp(`^${headerValuePrefix} (.*)$`));
  if (!match) {
    throw new UnauthorizedError(
      `Invalid ${headerKey} token - ${tokenString} does not match "${headerValuePrefix} .*"`,
    );
  }
  return match[1];
}

interface VerifiedJWT {
  sub: string;
}

function isVerifiedJWT(toBeDetermined: VerifiedJWT | unknown): toBeDetermined is VerifiedJWT {
  return (<VerifiedJWT>toBeDetermined).sub !== undefined;
}
