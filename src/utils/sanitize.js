/** Strips markup and control characters from user input before it is stored. */
export const clean = (v, max = 1000) =>
  typeof v === 'string' ? v.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ').trim().slice(0, max) : v;
