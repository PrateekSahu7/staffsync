// Attendance days are worked out in one company time zone (set COMPANY_TIMEZONE in .env)
exports.timezone = () => process.env.COMPANY_TIMEZONE || 'UTC';

// Today's date in the company time zone as YYYY-MM-DD
exports.today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: exports.timezone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

exports.validateTimezone = () => {
  try {
    exports.today();
    return true;
  } catch (err) {
    return false;
  }
};
