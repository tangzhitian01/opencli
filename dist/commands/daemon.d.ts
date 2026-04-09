/**
 * CLI commands for daemon lifecycle management:
 *   opencli daemon status  — show daemon state
 *   opencli daemon stop    — graceful shutdown
 *   opencli daemon restart — stop + respawn
 */
export declare function daemonStatus(): Promise<void>;
export declare function daemonStop(): Promise<void>;
export declare function daemonRestart(): Promise<void>;
