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
}

export const EMPLOYEE_UPDATE_SECTIONS = [
  "professional_detail",
  "shift_detail",
  "salary_detail",
  "leave_detail",
  "additional_detail",
]

export const LEAVE_STATUS = ["pending", "approved", "rejected", "withdrawn"];

export const SHIFT_DISPLAY = {
  "0": "Absent",
  "0.5": "Half Day",
  "0.75": "Late Login",
  "1": "Full Day",
}

export const TIME = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  infinite: Infinity
}