import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

//import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { certToPEM } from '../../auth/utils'
import { jwksUrl } from '../../config'

const logger = createLogger('auth')

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt
  //logger.info('Authorizing a user with token', jwt)

  const cert = await getCert(jwksUrl)
  logger.info('Authorizing a user with pub key', cert)

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

const getCert = async (endPointUrl: string) => {
  const response = await Axios.get(endPointUrl, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const keys = response.data.keys
  if (!keys || !keys.length) {
    logger.error('User not authorized', { error: 'The JWKS endpoint did not contain any keys' })
    throw new Error('The JWKS endpoint did not contain any keys')
  }
  const signingKeys = keys
    .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signature verification
      && key.kty === 'RSA' // We are only supporting RSA (RS256)
      && key.kid           // The `kid` must be present to be useful for later
      && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
    ).map(key => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
    });

  // If at least one signing key doesn't exist we have a problem... Kaboom.
  if (!signingKeys.length) {
    logger.error('User not authorized', { error: 'The JWKS endpoint did not contain any signature verification keys' })
    throw new Error('The JWKS endpoint did not contain any signature verification keys');
  }
  // If needed implement to return key by specifying kid. for now returning first key
  return signingKeys[0].publicKey
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    logger.error('User not authorized', { error: 'No authentication header' })
    throw new Error('No authentication header')
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')){
    logger.error('User not authorized', { error: 'Invalid authentication header' })
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
