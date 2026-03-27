const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    'dashboard', 'clients', 'pets', 'appointments', 'medical_records',
    'pos', 'inventory', 'settings', 'users',
  ],
  pro: [
    'dashboard', 'clients', 'pets', 'appointments', 'medical_records',
    'pos', 'inventory', 'settings', 'users',
    'grooming', 'hospitalization', 'laboratory', 'preventive',
    'loyalty', 'gift_cards', 'reports', 'portal', 'communication',
  ],
  enterprise: [
    'dashboard', 'clients', 'pets', 'appointments', 'medical_records',
    'pos', 'inventory', 'settings', 'users',
    'grooming', 'hospitalization', 'laboratory', 'preventive',
    'loyalty', 'gift_cards', 'reports', 'portal', 'communication',
    'multi_store', 'custom_branding', 'api_access',
  ],
}

export function hasFeature(plan: string, feature: string): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false
}

export function getRequiredPlan(feature: string): string {
  if (['grooming', 'hospitalization', 'laboratory', 'preventive', 'loyalty', 'gift_cards', 'reports', 'portal', 'communication'].includes(feature)) return 'pro'
  if (['multi_store', 'custom_branding', 'api_access'].includes(feature)) return 'enterprise'
  return 'starter'
}
