export type UserPlan = 'free' | 'pro';

export type EntitlementSource = 'default' | 'local_dev' | 'remote_future';

export type EntitlementState = {
  plan: UserPlan;
  isPro: boolean;
  source: EntitlementSource;
};

export type LimitCheckReason =
  | 'daily_sessions'
  | 'daily_questions'
  | 'review_mistakes'
  | 'advanced_stats';

export type LimitDecision = {
  allowed: boolean;
  reason?: LimitCheckReason;
  message?: string;
  /** Durante o beta, permite continuar após aviso amigável. */
  softOverride: boolean;
};
