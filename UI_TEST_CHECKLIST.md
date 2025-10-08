# Manual UI Testing Checklist

## Test Session: 2025-10-08

**Test Environment:**
- URL: http://localhost:5173/demo.html
- Browsers: Chrome, Firefox, Safari
- Devices: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

---

## 1. Initial Survey Flow ✅

### Desktop
- [ ] Survey modal appears on first load
- [ ] Can select multiple interests (minimum 3)
- [ ] Location field accepts city name
- [ ] "Start Discovering" button enabled only after 3+ interests
- [ ] Modal closes after submission
- [ ] Articles load based on selected interests

### Tablet
- [ ] Survey modal responsive (fits screen)
- [ ] Touch interactions work smoothly
- [ ] Keyboard input works for location

### Mobile
- [ ] Survey modal fills screen properly
- [ ] Interest chips wrap correctly
- [ ] Keyboard doesn't break layout
- [ ] Submit button accessible

---

## 2. Article Browse & Feed ✅

### Article Display
- [ ] Articles show: title, summary, source, author, date
- [ ] Images load correctly (or placeholder if missing)
- [ ] Reading time displayed
- [ ] Difficulty badge visible (beginner/intermediate/advanced)
- [ ] Content type badge visible (news/tutorial/guide/etc.)
- [ ] Topics/tags displayed
- [ ] Location tags visible

### Skeleton Loading States
- [ ] Skeleton cards show while loading
- [ ] Smooth transition from skeleton to real content
- [ ] No layout shift (CLS ≤ 0.05)

### Filtering & Search
- [ ] Search box filters articles by title/summary
- [ ] Source filter dropdown works
- [ ] Date range filter works
- [ ] Topic filter works
- [ ] Multiple filters combine correctly
- [ ] Clear filters button resets all

### Infinite Scroll / Pagination
- [ ] More articles load on scroll
- [ ] Loading indicator visible
- [ ] No duplicate articles

---

## 3. Article Reading Flow ✅

### Article Modal
- [ ] Click article opens modal
- [ ] Full article content displayed
- [ ] Images render properly
- [ ] Author and metadata visible
- [ ] Close button (X) works
- [ ] Click outside modal closes it
- [ ] ESC key closes modal

### Resources Section
- [ ] Resources list displayed for library/tutorial content
- [ ] Resource links clickable
- [ ] Resource descriptions shown

### Related Articles
- [ ] "Related Articles" section appears at bottom
- [ ] 3-5 related articles shown
- [ ] Click related article loads new article
- [ ] Related articles match topic/tags

### Accessibility
- [ ] Can navigate with keyboard (Tab, Enter, ESC)
- [ ] Screen reader announces content
- [ ] Focus trap works in modal

---

## 4. Profile Management ✅

### Profile Editor
- [ ] Profile edit button accessible
- [ ] Profile modal opens
- [ ] Can upload/change avatar
- [ ] Can edit display name
- [ ] Can edit bio
- [ ] Can add/remove interests
- [ ] Can change location
- [ ] Save button updates profile
- [ ] Cancel button discards changes

### Profile Preview
- [ ] Profile preview shows current data
- [ ] Avatar displays correctly
- [ ] Interests shown as chips
- [ ] Location displayed
- [ ] Bio text formatted correctly

### Multiple Profiles (if implemented)
- [ ] Can create multiple profiles (Work, Personal, etc.)
- [ ] Can switch between profiles
- [ ] Each profile has separate feed
- [ ] Profile data persists

---

## 5. Notifications & Discovery ✅

### Notification Badge
- [ ] Badge appears when new notifications
- [ ] Count updates in real-time
- [ ] Badge animates (glow/pulse)
- [ ] No layout shift (16×16px reserved space)

### Notification Panel
- [ ] Click badge opens notification panel
- [ ] Notifications grouped by type
- [ ] Article notifications show title/summary
- [ ] User notifications show user info
- [ ] Discovery notifications show match reason
- [ ] Click notification navigates to content
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Clear all works

### Discovery Matches
- [ ] "Discover" section shows matches
- [ ] Matches sorted by relevance score
- [ ] Match reason displayed
- [ ] Click match opens article/user
- [ ] High-score matches highlighted
- [ ] Refresh button updates matches

---

## 6. Chat & DM Threads ✅

### User Sidebar
- [ ] Users with similar interests displayed
- [ ] User avatars loaded
- [ ] Common interests shown
- [ ] Click user opens chat

### Chat Interface
- [ ] Chat modal opens
- [ ] Previous messages loaded
- [ ] Send message works
- [ ] Messages appear in real-time
- [ ] Timestamp shown
- [ ] Scroll to bottom on new message

### DM Badge
- [ ] Unread DM count badge shown
- [ ] Badge updates when new message arrives
- [ ] Click navigates to chat
- [ ] Badge clears when messages read

---

## 7. Responsive Layouts ✅

### Desktop (lg: 1024px+)
- [ ] 3-column layout: Settings | Feed | Users
- [ ] All sections visible
- [ ] Smooth scrolling
- [ ] Glassmorphism effects visible

### Tablet (md: 768px-1023px)
- [ ] 2-column layout: Settings + Feed | Users (drawer)
- [ ] Users section as offcanvas drawer
- [ ] Drawer slides in/out smoothly
- [ ] Touch gestures work

### Mobile (sm: < 768px)
- [ ] Stacked single-column layout
- [ ] Feed takes full width
- [ ] Settings as top sheet/drawer
- [ ] Users as bottom sheet
- [ ] Pull-to-refresh works (if implemented)

---

## 8. Performance Metrics ✅

### Page Load
- [ ] TTI (Time to Interactive) < 2.5s
- [ ] FCP (First Contentful Paint) < 1.5s
- [ ] LCP (Largest Contentful Paint) < 2.5s

### Runtime Performance
- [ ] 60 FPS during scroll
- [ ] Smooth animations
- [ ] No jank/stuttering
- [ ] Memory usage stable

### Bundle Size
- [ ] Initial bundle ≤ 350 kB (gzipped)
- [ ] Code splitting working
- [ ] Lazy loading for routes

---

## 9. Data Persistence ✅

### LocalStorage
- [ ] Interests saved
- [ ] Profile data saved
- [ ] Notification state saved
- [ ] Article read state saved

### Gun.js P2P Sync
- [ ] Data syncs across tabs
- [ ] Data persists after reload
- [ ] Offline mode works
- [ ] Real-time updates

---

## 10. Error Handling ✅

### Network Errors
- [ ] RSS feed failure handled gracefully
- [ ] Error message shown to user
- [ ] Retry button works
- [ ] Offline indicator shown

### Validation Errors
- [ ] Form validation works
- [ ] Error messages clear
- [ ] Invalid input prevented

### Edge Cases
- [ ] Empty feed state handled
- [ ] No search results handled
- [ ] Missing images handled (placeholder)
- [ ] Long titles truncated

---

## 11. Visual Quality ✅

### Design System
- [ ] Glassmorphism applied consistently
- [ ] Gradient backgrounds render correctly
- [ ] Shadows and depth appropriate
- [ ] Colors: indigo-600 → purple-600 → pink-500

### Typography
- [ ] Font sizes readable
- [ ] Line heights appropriate
- [ ] Text colors: slate-100 / slate-400
- [ ] Headings hierarchy clear

### Micro-interactions
- [ ] Hover effects work
- [ ] Scale transform (scale-105) smooth
- [ ] Fade/slide animations smooth
- [ ] Pulse animation on badges

### Dark Mode
- [ ] Dark mode toggle works
- [ ] All components support dark mode
- [ ] Contrast ratios acceptable
- [ ] Images adjust appropriately

---

## 12. Accessibility (WCAG 2.1 AA) ✅

### Keyboard Navigation
- [ ] Tab order logical
- [ ] Focus visible
- [ ] Enter/Space activate buttons
- [ ] ESC closes modals

### Screen Reader
- [ ] ARIA labels present
- [ ] Landmarks defined
- [ ] Announcements clear
- [ ] Alt text on images

### Color Contrast
- [ ] Text readable
- [ ] Interactive elements distinguishable
- [ ] Focus indicators visible

---

## 13. Cross-Browser Compatibility ✅

### Chrome (Latest)
- [ ] All features work
- [ ] Performance good

### Firefox (Latest)
- [ ] All features work
- [ ] No console errors

### Safari (Latest)
- [ ] All features work
- [ ] Gun.js works
- [ ] WebAuthn works

### Edge (Latest)
- [ ] All features work
- [ ] Compatible APIs

---

## Issues Found

### Critical (P0)
_None found yet_

### High (P1)
_List any high priority issues_

### Medium (P2)
_List any medium priority issues_

### Low (P3)
_List any low priority issues_

---

## Test Results Summary

**Total Checks:** 150+
**Passed:** _To be filled_
**Failed:** _To be filled_
**Skipped:** _To be filled_

**Overall Status:** ✅ / ⚠️ / ❌

---

## Notes

- Test on real devices when possible
- Use Chrome DevTools device emulation for quick checks
- Check Network tab for performance
- Monitor Console for errors/warnings
- Use Lighthouse for automated audits

---

**Tester:** Claude
**Date:** 2025-10-08
**Build:** Development (localhost:5173)
