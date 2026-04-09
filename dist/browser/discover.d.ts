/**
 * Daemon discovery — checks if the daemon is running.
 */
import { isDaemonRunning } from './daemon-client.js';
export { isDaemonRunning };
/**
 * Check daemon status and return connection info.
 */
export declare function checkDaemonStatus(opts?: {
    timeout?: number;
}): Promise<{
    running: boolean;
    extensionConnected: boolean;
    extensionVersion?: string;
}>;
