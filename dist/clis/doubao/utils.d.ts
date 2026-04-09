import type { IPage } from '../../types.js';
export declare const DOUBAO_DOMAIN = "www.doubao.com";
export declare const DOUBAO_CHAT_URL = "https://www.doubao.com/chat";
export declare const DOUBAO_NEW_CHAT_URL = "https://www.doubao.com/chat/new-thread/create-by-msg";
export interface DoubaoConversation {
    Id: string;
    Title: string;
    Url: string;
}
export interface DoubaoTurn {
    Role: 'User' | 'Assistant' | 'System';
    Text: string;
}
export interface DoubaoPageState {
    url: string;
    title: string;
    isLogin: boolean | null;
    accountDescription: string;
    placeholder: string;
}
export declare function ensureDoubaoChatPage(page: IPage): Promise<void>;
export declare function getDoubaoPageState(page: IPage): Promise<DoubaoPageState>;
export declare function getDoubaoTurns(page: IPage): Promise<DoubaoTurn[]>;
export declare function getDoubaoVisibleTurns(page: IPage): Promise<DoubaoTurn[]>;
export declare function getDoubaoTranscriptLines(page: IPage): Promise<string[]>;
export declare function sendDoubaoMessage(page: IPage, text: string): Promise<'button' | 'enter'>;
export declare function waitForDoubaoResponse(page: IPage, beforeLines: string[], beforeTurns: DoubaoTurn[], promptText: string, timeoutSeconds: number): Promise<string>;
export declare function getDoubaoConversationList(page: IPage): Promise<DoubaoConversation[]>;
export interface DoubaoMessage {
    Role: 'User' | 'Assistant' | 'System';
    Text: string;
    HasMeetingCard: boolean;
}
export interface DoubaoMeetingInfo {
    title: string;
    time: string;
}
export declare function parseDoubaoConversationId(input: string): string;
export declare function navigateToConversation(page: IPage, conversationId: string): Promise<void>;
export declare function getConversationDetail(page: IPage, conversationId: string): Promise<{
    messages: DoubaoMessage[];
    meeting: DoubaoMeetingInfo | null;
}>;
export declare function mergeTranscriptSnapshots(existing: string, incoming: string): string;
export declare function openMeetingPanel(page: IPage, conversationId: string): Promise<boolean>;
export declare function getMeetingSummary(page: IPage): Promise<string>;
export declare function getMeetingChapters(page: IPage): Promise<string>;
export declare function getMeetingTranscript(page: IPage): Promise<string>;
export declare function triggerTranscriptDownload(page: IPage): Promise<boolean>;
export declare function startNewDoubaoChat(page: IPage): Promise<string>;
