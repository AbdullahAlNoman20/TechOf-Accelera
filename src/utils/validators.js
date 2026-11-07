export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
export const isPhone = (v) => String(v || '').replace(/\D/g, '').length >= 8;

/** Validates form values against field definitions. Returns { field: message }. */
export function validateFields(fields, values) {
  const errors = {};
  fields.forEach((f) => {
    const v = values[f.name];
    const empty = v === undefined || v === null || String(v).trim() === '';
    if (f.required && empty) return void (errors[f.name] = `${f.label} is required`);
    if (empty) return;
    if (f.type === 'email' && !isEmail(v)) errors[f.name] = 'Enter a valid email address';
    else if (f.type === 'tel' && !isPhone(v)) errors[f.name] = 'Enter a valid phone number';
    else if (f.type === 'number') {
      if (Number.isNaN(Number(v))) errors[f.name] = 'Enter a number';
      else if (f.min !== undefined && Number(v) < f.min) errors[f.name] = `Minimum is ${f.min}`;
      else if (f.max !== undefined && Number(v) > f.max) errors[f.name] = `Maximum is ${f.max}`;
    }
  });
  return errors;
}
