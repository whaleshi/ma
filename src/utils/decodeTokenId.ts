export interface DecodedTokenId {
  version: bigint;
  domain: bigint;
  category: bigint;
  subType: bigint;
  rarity: bigint;
  index: bigint;
}

const INDEX_BITS = 128;
const RARITY_BITS = 32;
const SUBTYPE_BITS = 32;
const CATEGORY_BITS = 32;
const DOMAIN_BITS = 16;
const VERSION_BITS = 16;

const INDEX_SHIFT = 0;
const RARITY_SHIFT = INDEX_SHIFT + INDEX_BITS;
const SUBTYPE_SHIFT = RARITY_SHIFT + RARITY_BITS;
const CATEGORY_SHIFT = SUBTYPE_SHIFT + SUBTYPE_BITS;
const DOMAIN_SHIFT = CATEGORY_SHIFT + CATEGORY_BITS;
const VERSION_SHIFT = DOMAIN_SHIFT + DOMAIN_BITS;

const INDEX_OFFSET = 1_000_000n;

const mask = (bits: number) => (1n << BigInt(bits)) - 1n;

export function decodeTokenId(tokenId: number | bigint | string): DecodedTokenId {
  const tokenIdBN = BigInt(tokenId);

  const INDEX_MASK = mask(INDEX_BITS);
  const RARITY_MASK = mask(RARITY_BITS);
  const SUBTYPE_MASK = mask(SUBTYPE_BITS);
  const CATEGORY_MASK = mask(CATEGORY_BITS);
  const DOMAIN_MASK = mask(DOMAIN_BITS);
  const VERSION_MASK = mask(VERSION_BITS);

  const version = (tokenIdBN >> BigInt(VERSION_SHIFT)) & VERSION_MASK;
  const domain = (tokenIdBN >> BigInt(DOMAIN_SHIFT)) & DOMAIN_MASK;
  const category = (tokenIdBN >> BigInt(CATEGORY_SHIFT)) & CATEGORY_MASK;
  const subType = (tokenIdBN >> BigInt(SUBTYPE_SHIFT)) & SUBTYPE_MASK;
  const rarity = (tokenIdBN >> BigInt(RARITY_SHIFT)) & RARITY_MASK;
  let index = tokenIdBN & INDEX_MASK;
  index = index - INDEX_OFFSET;

  return {
    version,
    domain,
    category,
    subType,
    rarity,
    index,
  };
}
