export const MAX_FILE_SIZE = {
  PROFILE_IMG: 12024 * 1024 * 5,
};

export const ACCEPTED_FILE_MIME_TYPES = {
  PROFILE_IMG: ["image/webp", "image/jpg", "image/png", "image/svg"],
};

export const DOCUMENT_FILE_TYPES_DISPLAY = {
  "image/webp": "WEBP",
  "image/jpg": "JPG",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/svg": "SVG",
  "application/pdf": "PDF"
} as const

export const EMPLOYEE_UPDATE_SECTIONS = [
  "professional_detail",
  "shift_detail",
  "salary_detail",
  "leave_detail",
  "additional_detail",
] 