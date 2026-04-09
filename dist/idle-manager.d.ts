/**
 * Manages daemon idle timeout with dual-condition logic:
 * exits only when BOTH CLI is idle AND Extension is disconnected.
 */
export declare class IdleManager {
    private _timer;
    private _lastCliRequestTime;
    private _extensionConnected;
    private _timeoutMs;
    private _onExit;
    constructor(timeoutMs: number, onExit: () => void);
    get lastCliRequestTime(): number;
    /** Call when an HTTP request arrives from CLI */
    onCliRequest(): void;
    /** Call when Extension WebSocket connects or disconnects */
    setExtensionConnected(connected: boolean): void;
    private _clearTimer;
    private _resetTimer;
}
