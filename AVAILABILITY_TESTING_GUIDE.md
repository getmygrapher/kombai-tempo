# Availability Management - Testing Guide

## Quick Start Testing

### Prerequisites
1. ✅ Supabase database with schemas applied
2. ✅ User authenticated in the application
3. ✅ Environment variables configured

---

## Manual Testing Steps

### Test 1: Basic Calendar Save
**Objective:** Verify availability can be saved to backend

1. Navigate to `/availability/calendar` or click "Calendar" in navigation
2. Click on any date in the calendar
3. Time slot selector dialog should open
4. Select time slot duration (e.g., "1 hour")
5. Click on time slots to select them (e.g., 9:00-10:00, 10:00-11:00)
6. Verify selected slots are highlighted
7. Click "Save Availability" button
8. **Expected:** 
   - Button shows "Saving..." state
   - Success message appears: "Availability saved successfully!"
   - Dialog closes automatically after 1 second
   - Calendar cell updates with color indicator

**Pass Criteria:** ✅ Date cell shows green (available) color

---

### Test 2: Verify Data Persists
**Objective:** Confirm data is actually saved to database

1. After Test 1, refresh the page (F5)
2. **Expected:**
   - Calendar loads with previously saved data
   - Dates with availability show correct colors
3. Click on the date you just saved
4. **Expected:**
   - Time slots you selected are displayed
   - Correct time ranges shown

**Pass Criteria:** ✅ Data persists after page refresh

---

### Test 3: Error Handling
**Objective:** Verify proper error handling

1. Open browser DevTools (F12)
2. Go to Network tab
3. Set "Offline" mode
4. Try to save availability
5. **Expected:**
   - Error message appears
   - Message explains the failure
   - Dialog doesn't close
   - User can retry

**Pass Criteria:** ✅ Error message shown, no crashes

---

### Test 4: Multiple Dates
**Objective:** Test saving to multiple dates

1. Click a date in calendar
2. Select time slots
3. Save
4. Repeat for 3-4 different dates
5. **Expected:**
   - Each save succeeds independently
   - All dates show correct availability
   - No data overwrites

**Pass Criteria:** ✅ All dates saved correctly

---

### Test 5: Authentication Required
**Objective:** Verify authentication is required

1. Log out of the application
2. Try to access `/availability/calendar`
3. **Expected:**
   - Redirected to login/welcome page
   - Cannot access calendar without auth

**Pass Criteria:** ✅ Proper redirect, no crashes

---

## Database Verification

### Check Saved Data in Supabase

```sql
-- View calendar entries for a user
SELECT 
  date,
  status,
  notes,
  created_at,
  updated_at
FROM calendar_entries
WHERE user_id = 'your-user-id'
ORDER BY date DESC
LIMIT 10;

-- View time slots for a date
SELECT 
  ce.date,
  ts.start_time,
  ts.end_time,
  ts.status,
  ts.is_booked
FROM time_slots ts
JOIN calendar_entries ce ON ce.id = ts.calendar_entry_id
WHERE ce.user_id = 'your-user-id'
  AND ce.date = '2025-10-25'
ORDER BY ts.start_time;
```

**Expected Results:**
- Entries exist for dates you saved
- Time slots match what you selected
- Status is 'available' or 'unavailable' as appropriate
- Timestamps are recent

---

## Browser Console Checks

### Success Indicators
Look for these in console:
```
✅ No error messages
✅ React Query cache updates
✅ Mutation success logged
```

### Error Indicators
Watch for these errors:
```
❌ "No authenticated user found"
❌ "Failed to save availability"
❌ Network errors (check Supabase connection)
❌ RPC function errors
```

---

## Network Tab Verification

### Successful Save Request
1. Open DevTools Network tab
2. Save availability
3. Look for POST to Supabase RPC endpoint
4. **Expected:**
   - Status: 200 OK
   - Response contains success: true
   - entries_created: 1 or more

### Request Payload Check
Verify the request body contains:
```json
{
  "availability_data": [
    {
      "date": "2025-10-25",
      "status": "available",
      "is_recurring": false,
      "recurring_pattern_id": null,
      "notes": null,
      "time_slots": [
        {
          "start_time": "09:00",
          "end_time": "10:00",
          "status": "available",
          "is_booked": false,
          "job_id": null,
          "job_title": null,
          "client_name": null,
          "rate_per_hour": null,
          "notes": null
        }
      ]
    }
  ]
}
```

**Critical Checks:**
- ✅ Date is "YYYY-MM-DD" format (NOT full timestamp)
- ✅ NULL values (not empty strings) for optional fields
- ✅ User ID is not "user_123" or any hardcoded value

---

## Common Issues & Solutions

### Issue 1: "No authenticated user found"
**Cause:** User not logged in or session expired
**Solution:** 
1. Check if user is logged in
2. Refresh page to restore session
3. Re-authenticate if needed

### Issue 2: Calendar shows wrong month data
**Cause:** Date range not updated (fixed)
**Solution:** Already fixed - calendar now fetches correct month

### Issue 3: Dialog doesn't close after save
**Cause:** onSaveComplete not triggered (fixed)
**Solution:** Already fixed - dialog auto-closes

### Issue 4: Empty strings causing errors
**Cause:** NULL handling (fixed)
**Solution:** Already fixed - uses NULL instead of empty strings

### Issue 5: TypeScript errors in console
**Cause:** Type mismatches (fixed)
**Solution:** Already fixed - TimeSlot interface updated

---

## Performance Testing

### Test Load Times
1. Open DevTools Network tab
2. Navigate to calendar
3. **Expected:**
   - Initial load < 2 seconds
   - Calendar data fetch < 500ms
   - Save operation < 1 second

### Test React Query Caching
1. Navigate to calendar
2. Note network requests
3. Navigate away and back
4. **Expected:**
   - Second load uses cache
   - No redundant API calls
   - Data shows immediately

---

## Regression Testing

### After Each Code Change
- [ ] Basic save still works
- [ ] Multiple dates work
- [ ] Error handling works
- [ ] Page refresh persists data
- [ ] Calendar displays correct colors
- [ ] Dialog opens and closes properly
- [ ] Success/error messages show
- [ ] No console errors

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

**All browsers should:**
- Display calendar correctly
- Save functionality works
- Dialogs render properly
- Colors and styles consistent

---

## Mobile Testing (Optional)

### Responsive Design
1. Open DevTools
2. Toggle device emulation
3. Test on mobile viewport
4. **Expected:**
   - Calendar adapts to screen size
   - Touch interactions work
   - Dialog is mobile-friendly

---

## Automated Testing Checklist

### Unit Tests (Future Implementation)
```typescript
// Example test cases to implement
describe('TimeSlotSelector', () => {
  it('should use authenticated user ID', () => {});
  it('should format date correctly', () => {});
  it('should handle save errors', () => {});
  it('should close dialog on success', () => {});
});

describe('AvailabilityService', () => {
  it('should pass NULL for empty values', () => {});
  it('should format dates as YYYY-MM-DD', () => {});
  it('should calculate status correctly', () => {});
});
```

---

## Sign-off Checklist

Before considering the feature complete:

### Functionality
- [ ] Can save single date availability
- [ ] Can save multiple dates
- [ ] Can view saved availability
- [ ] Data persists after refresh
- [ ] Correct month data displayed

### User Experience
- [ ] Clear visual feedback on actions
- [ ] Success messages show
- [ ] Error messages are helpful
- [ ] Loading states are clear
- [ ] Dialog behavior is intuitive

### Technical
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] Network requests succeed
- [ ] Database entries created

### Security
- [ ] RLS policies enforced
- [ ] User can only see own data
- [ ] Authentication required
- [ ] No unauthorized access

---

## Support & Debugging

### Enable Debug Logging
Add to browser console:
```javascript
localStorage.setItem('debug', 'availability:*');
```

### Check Supabase Dashboard
1. Go to Supabase project
2. Check Table Editor
3. View calendar_entries table
4. Verify your entries exist

### Check RLS Policies
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'calendar_entries';

-- Should return: rowsecurity = true
```

---

## Success Criteria

The availability management system is working correctly when:

✅ Users can select dates in calendar  
✅ Time slot dialog opens on date click  
✅ Time slots can be selected  
✅ Save button triggers backend save  
✅ Success message displays  
✅ Dialog closes automatically  
✅ Calendar updates with correct colors  
✅ Data persists after page refresh  
✅ Correct data shown in Supabase  
✅ No console errors  
✅ Fast and responsive performance  

---

## Contact

For issues or questions:
1. Check browser console for detailed errors
2. Verify Supabase connection in Network tab
3. Review this testing guide for common issues
4. Check `AVAILABILITY_MANAGEMENT_BUG_FIXES.md` for known fixes

---

**Last Updated:** 2025-10-24  
**Version:** 1.0  
**Status:** ✅ All critical bugs fixed
