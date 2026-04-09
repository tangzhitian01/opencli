/**
 * Manages daemon idle timeout with dual-condition logic:
 * exits only when BOTH CLI is idle AND Extension is disconnected.
 */
export class IdleManager {
    _timer = null;
    _lastCliRequestTime = Date.now();
    _extensionConnected = false;
    _timeoutMs;
    _onExit;
    constructor(timeoutMs, onExit) {
        this._timeoutMs = timeoutMs;
        this._onExit = onExit;
    }
    get lastCliRequestTime() {
        return this._lastCliRequestTime;
    }
    /** Call when an HTTP request arrives from CLI */
    onCliRequest() {
        this._lastCliRequestTime = Date.now();
        this._resetTimer();
    }
    /** Call when Extension WebSocket connects or disconnects */
    setExtensionConnected(connected) {
        this._extensionConnected = connected;
        if (connected) {
            this._clearTimer();
        }
        else {
            this._resetTimer();
        }
    }
    _clearTimer() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }
    _resetTimer() {
        this._clearTimer();
        if (this._timeoutMs <= 0)
            return;
        if (this._extensionConnected)
            return;
        const elapsed = Date.now() - this._lastCliRequestTime;
        if (elapsed >= this._timeoutMs) {
            this._onExit();
            return;
        }
        this._timer = setTimeout(() => {
            this._onExit();
        }, this._timeoutMs - elapsed);
    }
}
