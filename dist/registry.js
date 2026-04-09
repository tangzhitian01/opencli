/**
 * Core registry: Strategy enum, Arg/CliCommand interfaces, cli() registration.
 */
export var Strategy;
(function (Strategy) {
    Strategy["PUBLIC"] = "public";
    Strategy["COOKIE"] = "cookie";
    Strategy["HEADER"] = "header";
    Strategy["INTERCEPT"] = "intercept";
    Strategy["UI"] = "ui";
})(Strategy || (Strategy = {}));
const _registry = globalThis.__opencli_registry__ ??= new Map();
export function cli(opts) {
    const strategy = opts.strategy ?? (opts.browser === false ? Strategy.PUBLIC : Strategy.COOKIE);
    const browser = opts.browser ?? (strategy !== Strategy.PUBLIC);
    const aliases = normalizeAliases(opts.aliases, opts.name);
    const cmd = {
        site: opts.site,
        name: opts.name,
        aliases,
        description: opts.description ?? '',
        domain: opts.domain,
        strategy,
        browser,
        args: opts.args ?? [],
        columns: opts.columns,
        func: opts.func,
        pipeline: opts.pipeline,
        timeoutSeconds: opts.timeoutSeconds,
        footerExtra: opts.footerExtra,
        requiredEnv: opts.requiredEnv,
        deprecated: opts.deprecated,
        replacedBy: opts.replacedBy,
        navigateBefore: opts.navigateBefore,
    };
    registerCommand(cmd);
    return cmd;
}
export function getRegistry() {
    return _registry;
}
export function fullName(cmd) {
    return `${cmd.site}/${cmd.name}`;
}
export function strategyLabel(cmd) {
    return cmd.strategy ?? Strategy.PUBLIC;
}
export function registerCommand(cmd) {
    const canonicalKey = fullName(cmd);
    const existing = _registry.get(canonicalKey);
    if (existing) {
        for (const [key, value] of _registry.entries()) {
            if (value === existing && key !== canonicalKey)
                _registry.delete(key);
        }
    }
    const aliases = normalizeAliases(cmd.aliases, cmd.name);
    cmd.aliases = aliases.length > 0 ? aliases : undefined;
    _registry.set(canonicalKey, cmd);
    for (const alias of aliases) {
        _registry.set(`${cmd.site}/${alias}`, cmd);
    }
}
function normalizeAliases(aliases, commandName) {
    if (!Array.isArray(aliases) || aliases.length === 0)
        return [];
    const seen = new Set();
    const normalized = [];
    for (const alias of aliases) {
        const value = typeof alias === 'string' ? alias.trim() : '';
        if (!value || value === commandName || seen.has(value))
            continue;
        seen.add(value);
        normalized.push(value);
    }
    return normalized;
}
