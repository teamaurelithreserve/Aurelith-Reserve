export interface AccountTierConfig {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  minBalance?: number;
  maxBalance?: number;
  minDeposit: string;
  fee: string;
  interest: string;
  badge?: string;
  tagline: string;
  keyBenefits: string[];
}

export function formatCurrency(amount: number, includeCentsIfZero = false): string {
  if (amount % 1 === 0 && !includeCentsIfZero) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const ACCOUNT_TIERS: AccountTierConfig[] = [
  {
    id: 'Wow Checking',
    name: 'Wow Checking',
    aliases: ['Wow', 'WOW! Checking', 'Wow checking'],
    category: 'Everyday Checking',
    minBalance: 10000,
    maxBalance: 200000,
    minDeposit: '$25 min deposit',
    fee: '$6/mo (reduced $.10 per debit transaction)',
    interest: 'Standard',
    badge: 'Fan Favorite',
    tagline: 'A fan favorite! This account comes with additional benefits, making it the perfect everyday account.',
    keyBenefits: [
      'Debit card, online and mobile banking, and online bill pay',
      'Complimentary eStatement',
      'Cell phone protection*',
      'Fully managed fraud resolution services',
      'RideShare protection and roadside assistance*',
      'Travel and leisure discounts*',
      'Health discounts**',
      '$6 monthly maintenance fee, reduced by $.10 for each qualified debit card transaction',
      'Minimum deposit of $25',
    ],
  },
  {
    id: 'Free with eStatement',
    name: 'Free with eStatement',
    aliases: ['Free with eStatement Checking', 'Free with e-Statement'],
    category: 'Starter Checking',
    minBalance: 0,
    maxBalance: 1000000,
    minDeposit: '$25 min deposit',
    fee: '$0 monthly fee',
    interest: 'Standard',
    tagline: 'The perfect starter account if you are looking to open your first checking account.',
    keyBenefits: [
      'Debit card, online and mobile banking, and online bill pay',
      'Free eStatement',
      'Notary service',
      'No monthly fee',
      'Minimum deposit of $25',
    ],
  },
  {
    id: 'Heritage Checking',
    name: 'Heritage Checking',
    aliases: ['Heritage'],
    category: 'Seniors 62+ Checking',
    minBalance: 0,
    maxBalance: 5000000,
    minDeposit: '$25 min deposit',
    fee: '$0 monthly fee (Must be 62+ to open)',
    interest: 'Pays interest***',
    tagline: 'An interest-earning account that caters to those age 62 or better, because you have earned it.',
    keyBenefits: [
      'Debit card, online and mobile banking, and online bill pay',
      'Complimentary eStatement',
      'Paper statements with images, $2 per month',
      'Notary service',
      'Pays interest***',
      'Up to $10 in foreign ATM refunds per month',
      'Branded checks included, one order annually',
      '$0 monthly fee (Must be 62+ to open)',
      'Minimum deposit of $25',
    ],
  },
  {
    id: 'Interest Checking',
    name: 'Interest Checking',
    aliases: ['Interest'],
    category: 'Interest Checking',
    minBalance: 0,
    maxBalance: 20000000,
    minDeposit: '$25 min deposit',
    fee: '$6 monthly fee if average balance falls below $1,000',
    interest: 'Pays interest***',
    tagline: 'Perfect for those looking to earn interest without maintaining a higher average balance.',
    keyBenefits: [
      'Debit card, online and mobile banking, and online bill pay',
      'Complimentary eStatement',
      'Notary service',
      'Pays interest***',
      'Up to $6 in foreign ATM refunds per month',
      'Branded checks included, one order annually',
      '$6 monthly fee if average balance falls below $1,000',
      'Minimum deposit of $25',
    ],
  },
  {
    id: 'Premier Checking',
    name: 'Premier Checking',
    aliases: ['Aurelith Premier Checking', 'Premier'],
    category: 'Premier Checking',
    minBalance: 500,
    maxBalance: 5000000000,
    minDeposit: '$25 min deposit',
    fee: '$12 monthly fee if average balance falls below $10,000',
    interest: 'Pays interest***',
    badge: 'Premier',
    tagline: 'An interest-bearing account that is great for larger balances.',
    keyBenefits: [
      'Debit card, online and mobile banking, and online bill pay',
      'Complimentary eStatement',
      'Money orders and cashier\'s checks included at no additional cost',
      'Notary service',
      'Pays interest***',
      'Up to $15 in foreign ATM refunds per month',
      'Free branded checks, one order annually',
      '$12 monthly fee, if average balance falls below $10,000',
      'Minimum deposit of $25',
    ],
  },
  {
    id: 'Savings',
    name: 'Savings',
    aliases: ['High-Yield Reserve Savings', 'Reserve Savings', 'Aurelith Savings'],
    category: 'Reserve Savings',
    // Preserve its existing configuration. Do not assign a new balance range until explicitly instructed.
    minBalance: undefined,
    maxBalance: undefined,
    minDeposit: '$25 min deposit',
    fee: '$0 monthly service charge',
    interest: 'Earns interest',
    badge: 'High Yield',
    tagline: 'Earn interest on your balance and watch your savings do some heavy lifting.',
    keyBenefits: [
      'Start today with a $25 minimum deposit',
      'No monthly service charge',
      'Earn interest on your balance and watch your savings grow',
    ],
  },
];

/**
 * Normalizes an account type identifier or account name to its canonical AccountTierConfig.
 */
export function getAccountTier(nameOrId?: string): AccountTierConfig | undefined {
  if (!nameOrId || typeof nameOrId !== 'string') return undefined;
  const clean = nameOrId.trim().toLowerCase();

  return ACCOUNT_TIERS.find((tier) => {
    if (tier.id.toLowerCase() === clean) return true;
    if (tier.name.toLowerCase() === clean) return true;
    return tier.aliases.some((alias) => alias.toLowerCase() === clean);
  });
}

/**
 * Validates whether an action on an account respects the account tier's balance constraints.
 */
export function checkBalanceConstraints(
  accountNameOrId: string,
  candidateBalance: number
): { allowed: boolean; error?: string; minBalance?: number; maxBalance?: number } {
  const tier = getAccountTier(accountNameOrId);
  if (!tier) {
    return { allowed: true };
  }

  if (tier.minBalance !== undefined && candidateBalance < tier.minBalance) {
    return {
      allowed: false,
      minBalance: tier.minBalance,
      maxBalance: tier.maxBalance,
      error: `Transaction rejected. This transaction would leave ${tier.name} below its required minimum balance of ${formatCurrency(tier.minBalance)}.`,
    };
  }

  if (tier.maxBalance !== undefined && candidateBalance > tier.maxBalance) {
    return {
      allowed: false,
      minBalance: tier.minBalance,
      maxBalance: tier.maxBalance,
      error: `Transaction rejected. This transaction would cause ${tier.name} to exceed its maximum balance limit of ${formatCurrency(tier.maxBalance)}.`,
    };
  }

  return {
    allowed: true,
    minBalance: tier.minBalance,
    maxBalance: tier.maxBalance,
  };
}
