import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageService {
    uploadFile(fileBuffer: Buffer, originalFilename: string, projectId: string): Promise<{ url: string, sha256: string }>;
    getFileUrl(storedPath: string): string;
}

export class LocalStorageService implements StorageService {
    private baseDir: string;

    constructor() {
        // In dev, we store files in a Local project directory named 'storage'
        this.baseDir = path.join(process.cwd(), 'storage', 'uploads');
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    async uploadFile(fileBuffer: Buffer, originalFilename: string, projectId: string): Promise<{ url: string, sha256: string }> {
        // Calculate SHA-256 for duplicate detection
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        // Generate safe filename (we prefix with UUID or hash to ensure uniqueness on disk)
        const ext = path.extname(originalFilename);
        const safeName = `${projectId}_${hash.substring(0, 10)}${ext}`;

        // Create project specific folder
        const projectDir = path.join(this.baseDir, projectId);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        const filePath = path.join(projectDir, safeName);

        // Write to disk
        fs.writeFileSync(filePath, fileBuffer);

        // Provide a URL / Path
        // In local dev, we might serve this through a custom route or just keep the absolute / relative path.
        // For now, returning the relative path
        const fileUrl = `/api/storage/${projectId}/${safeName}`;

        return { url: fileUrl, sha256: hash };
    }

    getFileUrl(storedPath: string): string {
        return storedPath;
    }
}

// Instantiate default storage
export const storageService = new LocalStorageService();
