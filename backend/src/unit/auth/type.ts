export type IdentifyUserResult =
  | { ok: true; data: { id: string; gender: string } }
  | { ok: false; reason: string }

export type ChallengeUserResult =
  | { ok: true; message: string }
  | { ok: false; reason: string }

export type AuthenticateUserResult =
  | { ok: true; id: string }
  | { ok: false; reason: string }
