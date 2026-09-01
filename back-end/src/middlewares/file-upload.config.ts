import { diskStorage } from 'multer';
import 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

/**
 * Ensures that the target directory exists synchronously.
 */
function ensureDirExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Filter function for validating uploaded file formats (PDF, JPG, PNG).
 */
const fileFormatFilter = (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
  const isMimeValid = !!file.mimetype && !!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/i);
  const isExtValid = !!file.originalname && !!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i);

  if (!isMimeValid && !isExtValid) {
    return callback(new BadRequestException('Only PDF, JPG, and PNG files are allowed!'), false);
  }
  callback(null, true);
};

/**
 * Creates disk storage configuration for a given destination directory.
 */
function createDiskStorage(destinationPath: string) {
  return diskStorage({
    destination: (req, file, callback) => {
      ensureDirExists(destinationPath);
      callback(null, destinationPath);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExt = extname(file.originalname) || '';
      callback(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
    },
  });
}

/**
 * Upload configuration for citizen application documents.
 */
export const documentUploadConfig = {
  storage: createDiskStorage('./uploads/documents'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFormatFilter,
};

/**
 * Upload configuration for grievance evidence files.
 */
export const evidenceUploadConfig = {
  storage: createDiskStorage('./uploads/grievances'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFormatFilter,
};

/**
 * Upload configuration for service guidelines and certificate templates.
 */
export const serviceUploadConfig = {
  storage: createDiskStorage('./uploads/services'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFormatFilter,
};
