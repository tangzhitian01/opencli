import type { IPage } from '../../../types.js';
import type { Sts2Credentials } from './types.js';
/**
 * Fetch STS2 temporary credentials from the creator center.
 * These are used to authenticate Node.js-side TOS multipart uploads.
 * Returns: { access_key_id, secret_access_key, session_token, expired_time }
 */
export declare function getSts2Credentials(page: IPage): Promise<Sts2Credentials>;
