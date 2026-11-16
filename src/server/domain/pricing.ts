const PRICE = { post: 0.005, user: 0.01 };
const CANDIDATES_PER_SLOT = 4;

export const POSTS_PER_PERSON = 5;
export const MAX_SEEDS = 5;

export const searchSize = (max: number) => Math.min(100, Math.max(10, max * CANDIDATES_PER_SLOT));

export const seedFollowSize = (max: number, seeds: number) => Math.max(1, Math.ceil((max * CANDIDATES_PER_SLOT) / seeds));

export function runCostCeiling(mode: 'search' | 'seeds', max: number): number {
  const perPerson = POSTS_PER_PERSON * PRICE.post;
  const discovery = mode === 'search'
    ? searchSize(max) * (PRICE.post + PRICE.user)
    : MAX_SEEDS * PRICE.user + max * CANDIDATES_PER_SLOT * PRICE.user;
  return discovery + max * perPerson;
}
