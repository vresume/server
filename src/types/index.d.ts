export type Auth0Payload = {
  iss: string;
  sub: string;
  aud: string[];
  azp: string;
  exp: number;
  iat: number;
  scope: string;
  permissions: string[];
};

export type Auth0 = {
  payload: Auth0Payload;
  header: {
    alg: string;
    typ: string;
    kid: string;
  };
  token: string;
};

export interface ServerRequest extends Express.Request {
  auth: Auth0;
}
