import { type Arg, type CommandArgs } from '../../registry.js';
import type { IPage } from '../../types.js';
interface LinuxDoTagRecord {
    id: number;
    slug: string;
    name: string;
}
interface LinuxDoCategoryRecord {
    id: number;
    name: string;
    description: string;
    slug: string;
    parentCategoryId: number | null;
}
interface ResolvedLinuxDoCategory extends LinuxDoCategoryRecord {
    parent: LinuxDoCategoryRecord | null;
}
interface FeedRequest {
    url: string;
}
interface TopicListItem {
    title: string;
    replies: number;
    created: string;
    likes: number;
    views: number;
    url: string;
}
/**
 * 将命令参数转换为最终请求地址
 */
declare function resolveFeedRequest(page: IPage | null, kwargs: Record<string, any>): Promise<FeedRequest>;
export declare const LINUX_DO_FEED_ARGS: Arg[];
export declare function executeLinuxDoFeed(page: IPage | null, kwargs: CommandArgs): Promise<TopicListItem[]>;
export declare function buildLinuxDoCompatFooter(replacement: string): string;
export declare const __test__: {
    resetMetadataCaches(): void;
    setLiveMetadataForTests({ tags, categories, }: {
        tags?: LinuxDoTagRecord[] | null;
        categories?: ResolvedLinuxDoCategory[] | null;
    }): void;
    setCacheDirForTests(dir: string | null): void;
    resolveFeedRequest: typeof resolveFeedRequest;
};
export {};
