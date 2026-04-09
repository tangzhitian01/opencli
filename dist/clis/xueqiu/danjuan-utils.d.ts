/**
 * Shared helpers for Danjuan (蛋卷基金) adapters.
 *
 * Core design: a single page.evaluate call fetches the gain overview AND
 * all per-account holdings in parallel (Promise.all), minimising Node↔Browser
 * round-trips to exactly one.
 */
import type { IPage } from '../../types.js';
export declare const DANJUAN_DOMAIN = "danjuanfunds.com";
export declare const DANJUAN_ASSET_PAGE = "https://danjuanfunds.com/my-money";
export interface DanjuanAccount {
    accountId: string;
    accountName: string;
    accountType: string;
    accountCode: string;
    marketValue: number | null;
    dailyGain: number | null;
    mainFlag: boolean;
}
export interface DanjuanHolding {
    accountId: string;
    accountName: string;
    accountType: string;
    fdCode: string;
    fdName: string;
    category: string;
    marketValue: number | null;
    volume: number | null;
    usableRemainShare: number | null;
    dailyGain: number | null;
    holdGain: number | null;
    holdGainRate: number | null;
    totalGain: number | null;
    nav: number | null;
    marketPercent: number | null;
}
export interface DanjuanSnapshot {
    asOf: string | null;
    totalAssetAmount: number | null;
    totalAssetDailyGain: number | null;
    totalAssetHoldGain: number | null;
    totalAssetTotalGain: number | null;
    totalFundMarketValue: number | null;
    accounts: DanjuanAccount[];
    holdings: DanjuanHolding[];
}
/**
 * Fetch the complete Danjuan fund picture in ONE browser round-trip.
 *
 * Inside the browser context we:
 *   1. Fetch the gain/assets overview (contains account list)
 *   2. Promise.all → fetch every account's holdings in parallel
 *   3. Return the combined result to Node
 */
export declare function fetchDanjuanAll(page: IPage): Promise<DanjuanSnapshot>;
