// Navigation for the hash router: go('students', id) → #/students/<id>
export const go = (...parts) => {
  window.location.hash = '/' + parts.map(encodeURIComponent).join('/');
};
