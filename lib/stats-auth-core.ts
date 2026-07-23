export type StatsCredentials = {
  username: string;
  password: string;
};

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
  if (!match || match[1].length % 4 !== 0) {
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

    return (
      constantTimeEqual(username, credentials.username) &&
      constantTimeEqual(password, credentials.password)
    );
  } catch {
    return false;
  }
}
