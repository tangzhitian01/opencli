/**
 * ImageX cover image uploader.
 *
 * Uploads a JPEG/PNG image to ByteDance ImageX via a pre-signed PUT URL
 * obtained from the Douyin "apply cover upload" API.
 */
export interface ImageXUploadInfo {
    /** Pre-signed PUT target URL (provided by the apply cover upload API) */
    upload_url: string;
    /** Image URI to use in create_v2 (returned from the apply step) */
    store_uri: string;
}
/**
 * Upload a cover image to ByteDance ImageX via a pre-signed PUT URL.
 *
 * @param imagePath - Local file path to the image (JPEG/PNG/etc.)
 * @param uploadInfo - Upload URL and store_uri from the apply cover upload API
 * @returns The store_uri (= image_uri for use in create_v2)
 */
export declare function imagexUpload(imagePath: string, uploadInfo: ImageXUploadInfo): Promise<string>;
