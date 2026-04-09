/**
 * Shared YAML CLI definition types.
 * Used by both discovery.ts (runtime) and build-manifest.ts (build-time).
 */
/** Convert YAML args definition to the internal Arg[] format. */
export function parseYamlArgs(args) {
    if (!args || typeof args !== 'object')
        return [];
    const result = [];
    for (const [argName, argDef] of Object.entries(args)) {
        result.push({
            name: argName,
            type: argDef?.type ?? 'str',
            default: argDef?.default,
            required: argDef?.required ?? false,
            positional: argDef?.positional ?? false,
            help: argDef?.description ?? argDef?.help ?? '',
            choices: argDef?.choices,
        });
    }
    return result;
}
