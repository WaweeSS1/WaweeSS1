// NON-NEGOTIABLE compliance constants — ne módosítsd jogi review nélkül

export const COMPLIANCE = {
  // Minimális kifizetési összeg
  PAYOUT_MIN_USD: 20,

  // Alapértelmezett CPA összeg (broker-megerősített FTD után)
  CPA_AMOUNT_USD: 600,

  // CPA elosztás (hangolható, de a sum <= CPA_AMOUNT_USD)
  CPA_DISTRIBUTION: {
    NET_MARGIN_USD: 380,
    WELCOME_CASH_USD: 100,    // "megemelt első havi rebate" keretezés
    REFERRAL_CASH_USD: 80,    // csak qualified FTD után
    OPEX_USD: 40,
  },

  // RevShare rebate rate-ek (lot/USD)
  REBATE_RATE: {
    STANDARD: 1.20,  // ~$1.20/lot
    VIP: 1.60,       // ~$1.60/lot
  },

  // Jutalom felszabadítás feltételei
  REWARD_UNLOCK: {
    REQUIRES_BROKER_CONFIRMED_FTD: true,
    REQUIRES_QUALIFYING_VOLUME: true,
    CLAWBACK_ON_CPA_REVOKE: true,
  },

  // Fraud dedup jelzők
  FRAUD_DEDUP_SIGNALS: [
    "DUPLICATE_PHONE",
    "DUPLICATE_WALLET",
    "DUPLICATE_DEVICE",
    "DUPLICATE_IP",
  ] as const,

  // Risk warning szöveg — kötelező mindenhol
  RISK_WARNING: {
    SHORT: "CFD és forex kereskedés magas kockázattal jár. A tőkéd elveszítheted.",
    LONG: "A CFD-ek és devizapárok kereskedése spekulatív termék, és tőkéd elvesztésével járhat. A retail CFD-kereskedők nagy százaléka veszít pénzt. Ez nem befektetési tanács. Rebound eszközöket kínál, nem javaslatokat (Tools, not tips).",
    EU_ESMA: "A kiskereskedelmi ügyfelek %i%-a veszít pénzt ennél a szolgáltatónál. Győződj meg arról, hogy megérted a kockázatokat.",
  },

  // Tiltott megfogalmazások
  FORBIDDEN_PHRASES: [
    "garantált profit",
    "kockázatmentes",
    "biztos hozam",
    "befektetési tanács",
    "guaranteed return",
    "risk-free",
    "investment advice",
  ] as const,
} as const;

export type ComplianceConstants = typeof COMPLIANCE;
