/**
 * Shared utilities for CLI adapters.
 */
/**
 * Clamp a numeric value to [min, max].
 * Matches the signature of lodash.clamp and Rust's clamp.
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
