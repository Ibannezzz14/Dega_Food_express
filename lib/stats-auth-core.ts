export type StatsCredentials = {
  username: string;
  password: string;
};

const MAX_BASIC_TOKEN_LENGTH = 2048;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export function createStatsCredentials(
  usernameValue: string | undefined,
  passwordValue: string | undefined,
): StatsCredentials | null {
  const username = usernameValue?.trim();
  const password = passwordValue;

  if (
    !username ||
    username.length > 128 ||
    username.includes(":") ||
    CONTROL_CHARACTERS.test(username) ||
    !password ||
    password.length < 12 ||
    password.length > 256 ||
    CONTROL_CHARACTERS.test(password)
  ) {
    return null;
  }

  return { username, password };
}

function constantTimeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    difference |=
      (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

export function validateStatsAuthorization(
  authorization: string | null,
  credentials: StatsCredentials | null,
) {
  if (!credentials || !authorization) {
    return false;
  }

  const match = authorization.match(
    /^Basic[ \t]+([A-Za-z0-9+/]+={0,2})$/i,
  );
  if (
    !match ||
    match[1].length > MAX_BASIC_TOKEN_LENGTH ||
    match[1].length % 4 !== 0
  ) {
    return false;
  }

  try {
    const decoded = Buffer.from(match[1], "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 1) {
      return false;
    }

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);
    const usernameMatches = constantTimeEqual(
      username,
      credentials.username,
    );
    const passwordMatches = constantTimeEqual(
      password,
      credentials.password,
    );

    return usernameMatches && passwordMatches;
  } catch {
    return false;
  }
}
