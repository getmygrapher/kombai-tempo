import EXIF from 'exif-js';

export interface EXIFData {
  camera_model?: string;
  lens_model?: string;
  focal_length?: number;
  aperture?: number;
  shutter_speed?: string;
  iso_setting?: number;
  flash_used?: boolean;
  extraction_success: boolean;
}

export interface ExtractionResult {
  isValid: boolean;
  missingFields: string[];
  confidence: number;
}

export class EXIFExtractionService {
  async extractMetadata(imageFile: File): Promise<EXIFData> {
    return new Promise((resolve) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        EXIF.getData(imageFile as any, function() {
          const exifData: EXIFData = {
            camera_model: EXIF.getTag(this, "Model") || undefined,
            lens_model: EXIF.getTag(this, "LensModel") || undefined,
            focal_length: EXIF.getTag(this, "FocalLength") || undefined,
            aperture: EXIF.getTag(this, "FNumber") || undefined,
            shutter_speed: EXIF.getTag(this, "ExposureTime") || undefined,
            iso_setting: EXIF.getTag(this, "ISOSpeedRatings") || undefined,
            flash_used: EXIF.getTag(this, "Flash") !== 0,
            extraction_success: true
          };
          
          resolve(exifData);
        });
      } catch {
        resolve({
          extraction_success: false
        } as EXIFData);
      }
    });
  }
  
  validateExtraction(exifData: EXIFData): ExtractionResult {
    const requiredFields = ['camera_model', 'aperture', 'shutter_speed', 'iso_setting'];
    const missingFields = requiredFields.filter(field => !exifData[field as keyof EXIFData]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      confidence: (requiredFields.length - missingFields.length) / requiredFields.length
    };
  }
}

export const exifService = new EXIFExtractionService();