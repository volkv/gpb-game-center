export enum BuildingType {
  CENTRAL_BANK = 'central_bank',
  SECURITY_HQ = 'security_hq',
  CAPITAL_TOWER = 'capital_tower',
  LONGEVITY_PARK = 'longevity_park',
  PARTNER_MALL = 'partner_mall',
  RESEARCH_INSTITUTE = 'research_institute',
  CREDIT_OFFICE = 'credit_office',
  AUTO_SHOWROOM = 'auto_showroom',
  REAL_ESTATE_AGENCY = 'real_estate_agency'
}

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  level: number;
  lastCollected: number;
  isActive: boolean;
  isUpgrading?: boolean;
  upgradeEndTime?: number;
}

export interface BuildingConfig {
  type: BuildingType;
  name: string;
  description: string;
  basePrice: {
    coins: number;
    crystals: number;
    energy?: number;
  };
  income: {
    coins: number;
    crystals: number;
    interval: number;
  };
  maxLevel: number;
  size: {
    width: number;
    height: number;
  };
  unlockLevel: number;
  bankProduct: string;
  requiresBuilding?: BuildingType;
}