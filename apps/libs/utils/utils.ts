export function normalizeISODate(value: string){
    if (typeof value === 'string') {
      // If it's just a date (YYYY-MM-DD), convert to ISO-8601 DateTime
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(value + 'T00:00:00.000Z').toISOString();
      }
      // If it's already an ISO string, validate and return
      try {
        return new Date(value).toISOString();
      } catch {
        return value; // Let validator handle the error
      }
    }
    return value;
}