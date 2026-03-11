// Mobile Responsiveness Checkpoints
// Run this checklist on iOS Safari + Android Chrome

export const mobileChecklist = {
  viewport: {
    meta: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    check: 'All pages scale correctly'
  },
  touch: {
    minTarget: '44px minimum touch targets',
    check: 'All buttons/links easily tappable'
  },
  layout: {
    breakpoints: [320, 375, 414, 768],
    check: 'No horizontal scroll at any breakpoint'
  },
  forms: {
    inputs: 'Proper input types (tel, email, number)',
    check: 'Keyboard matches input type'
  },
  navigation: {
    mobile: 'Hamburger menu on <768px',
    check: 'Nav accessible on all screen sizes'
  }
}

// Tested Pages:
// ✓ /login
// ✓ /dashboard
// ✓ /cases
// ✓ /cases/new
// ✓ /settings
// Pending: /institution/*, /pricing
