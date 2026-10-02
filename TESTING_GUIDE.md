# Frontend Testing Guide - AI Voice Interview Coach

## Prerequisites

1. **Backend server running** on `http://localhost:8000`
2. **Frontend dev server running** on `http://localhost:3000`
3. **Microphone access** enabled in your browser
4. **Modern browser** (Chrome, Edge, or Firefox recommended)

## Starting the Servers

### Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
cd frontend
npm run dev
```

## Testing Checklist

### 1. Landing Page (/)
- [ ] Page loads successfully at `http://localhost:3000`
- [ ] Backend status indicator shows "Backend ready" (green dot)
- [ ] Form has all fields:
  - Role input (default: "Full Stack Developer")
  - Level dropdown (Junior/Mid-Level/Senior)
  - Interview Type dropdown (technical/behavioral/mixed)
  - Number of Questions input (1-10)
- [ ] "View History" button in header
- [ ] "Start Interview" button is enabled when backend is online
- [ ] Mobile responsive layout works

**Test Actions:**
1. Change form values
2. Try submitting with different configurations
3. Verify navigation to interview page after submission

---

### 2. Interview Page (/interview/[id])

#### Initial Load
- [ ] Page loads with session data
- [ ] Header shows role, level, and question progress
- [ ] "Live" indicator is visible with red pulsing dot
- [ ] First question is displayed
- [ ] Question is spoken aloud via browser TTS

#### Microphone Recording
- [ ] Blue circular mic button is visible
- [ ] "Press and hold to answer" instruction shown
- [ ] Button works on desktop (mouse press/release)
- [ ] Button works on mobile (touch start/end)

**Test Recording:**
1. Press and hold the mic button
2. Button turns red and shows "Recording..."
3. Speak your answer (test with ~30 seconds)
4. Release button to submit
5. "Processing your answer..." state appears
6. Transcription and evaluation are displayed

#### Microphone Permission Handling
- [ ] If permission denied, error message is shown
- [ ] If no microphone available, appropriate error displayed

#### Feedback Display
- [ ] Overall score badge (0-10) with color coding:
  - Red: 0-5
  - Yellow: 6-7
  - Green: 8-10
- [ ] Score breakdown (Relevance, Structure, Technical, Clarity)
- [ ] Speech metrics card (Words, WPM, Filler Count, Long Pauses)
- [ ] Strengths list with green checkmarks
- [ ] Improvements list with orange icons
- [ ] Sample answer in gray box
- [ ] "Next Question" or "View Full Report" button

**Test Actions:**
1. Answer multiple questions
2. Test with short answers (<10 words)
3. Test with long answers (>100 words)
4. Use filler words intentionally ("um", "uh", "like")
5. Add long pauses during recording
6. Complete all questions in the session

---

### 3. Report Page (/report/[id])

#### Overall Summary
- [ ] Large score badge displayed prominently
- [ ] Summary text explaining performance
- [ ] Color-coded based on score

#### Speech Metrics Summary
- [ ] Average metrics cards with icons:
  - Words (📝)
  - WPM (⚡)
  - Fillers (💬)
  - Pauses (⏸️)

#### Strengths & Improvements
- [ ] Two-column layout (desktop) or stacked (mobile)
- [ ] Strengths with green icon
- [ ] Improvements with orange icon
- [ ] Bullet points formatted correctly

#### Question Breakdown
- [ ] Each question numbered and displayed
- [ ] Individual scores shown
- [ ] Mini score bars for all 4 metrics
- [ ] Speech metrics per question
- [ ] Feedback summary (strengths/improvements)

#### Actions
- [ ] "Practice Again" button → navigates to home
- [ ] "View History" button → navigates to history page

**Test Actions:**
1. Review complete report
2. Verify all questions are listed
3. Check score calculations are correct
4. Test navigation buttons

---

### 4. History Page (/history)

#### Empty State
- [ ] If no interviews, shows empty state with CTA
- [ ] "Start Your First Interview" button works

#### With Data
- [ ] Performance trend chart displays
- [ ] Line chart shows score progression
- [ ] X-axis shows interview numbers
- [ ] Y-axis shows scores (0-10)
- [ ] Statistics cards display:
  - Total Interviews
  - Completed count
  - Average Score

#### Sessions List
- [ ] All sessions listed newest first
- [ ] Each session shows:
  - Role name
  - Status badge (Completed/In Progress)
  - Level and interview type
  - Date/time formatted
- [ ] Clicking session navigates to:
  - Report page (if completed)
  - Interview page (if in progress)
- [ ] Hover effect on session items

**Test Actions:**
1. Complete multiple interviews
2. Verify chart updates
3. Test session navigation
4. Check date formatting

---

## Error Scenarios to Test

### Backend Offline
1. Stop backend server
2. Refresh landing page
3. Verify "Backend offline" message (red dot)
4. "Start Interview" button should be disabled

### Network Errors
1. Test with slow connection (DevTools → Network → Slow 3G)
2. Verify loading states appear
3. Check error messages are user-friendly

### Invalid Session
1. Navigate to `/interview/invalid-id`
2. Should show error page
3. "Return Home" button works

### Microphone Issues
1. Deny microphone permission
2. Verify error message displayed
3. Instructions to enable permission shown

### Audio Processing Errors
1. Record very short audio (<1 second)
2. Record very long audio (>2 minutes)
3. Verify appropriate handling

---

## Browser Compatibility Testing

### Chrome/Edge (Recommended)
- [ ] All features work
- [ ] Audio recording format: `audio/webm`
- [ ] TTS works correctly
- [ ] Layout is correct

### Firefox
- [ ] All features work
- [ ] Audio recording works
- [ ] TTS works correctly

### Safari (if available)
- [ ] Microphone access works
- [ ] Audio recording format handled
- [ ] TTS works

---

## Mobile Testing

### Responsive Layout
- [ ] Landing page: Form is full-width, buttons stack
- [ ] Interview page: Mic button centered, text readable
- [ ] Report page: Cards stack, chart resizes
- [ ] History page: List items stack properly

### Touch Interactions
- [ ] Mic button: Touch and hold works
- [ ] Navigation buttons: Easy to tap
- [ ] Form inputs: Proper mobile keyboard
- [ ] No horizontal scrolling

### Microphone on Mobile
- [ ] HTTPS required (Vercel provides this)
- [ ] Browser prompts for permission correctly
- [ ] Recording works with touch gestures
- [ ] Release detection works reliably

---

## Performance Testing

### Load Times
- [ ] Landing page loads in <2s
- [ ] Interview page loads in <2s
- [ ] Report generation completes in <5s

### Audio Processing
- [ ] Transcription completes within reasonable time
- [ ] No UI freezing during processing
- [ ] Loading indicators shown appropriately

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Enter submits forms
- [ ] Focus indicators visible

### Screen Reader
- [ ] Form labels are announced
- [ ] Buttons have descriptive text
- [ ] Error messages are announced

### Color Contrast
- [ ] Text is readable on all backgrounds
- [ ] Score colors have sufficient contrast

---

## Known Limitations

1. **Browser TTS**: Voice quality depends on browser/OS
2. **Cold Start**: Backend may take time to respond on first request
3. **Audio Format**: WebM format may need conversion on backend
4. **Local Storage**: Not implemented yet (sessions in MongoDB only)
5. **Offline Mode**: Not supported

---

## Success Criteria

✅ **Phase 3 Complete When:**
1. Can create a new interview session
2. Can record and submit audio answers
3. Receive real-time feedback after each answer
4. Complete full interview and view report
5. View history of past interviews
6. All pages are responsive and mobile-friendly
7. Error states handled gracefully
8. Loading states provide feedback

---

## Next Steps (Phase 4 - Deployment)

After local testing is complete:
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Update environment variables
4. Test production deployment
5. Add rate limiting
6. Monitor for issues

---

## Troubleshooting

### "Backend offline" but server is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is on port 8000
- Check CORS settings in backend

### Microphone not working
- Check browser permissions (chrome://settings/content/microphone)
- Try HTTPS (required for production)
- Test with different browser

### Audio submission fails
- Check file size limits
- Verify audio format supported
- Check network tab for error details

### Report not loading
- Verify session completed
- Check browser console for errors
- Ensure all questions were answered

---

## Test Results Log

Date: ___________
Tester: ___________

| Test Area | Status | Notes |
|-----------|--------|-------|
| Landing Page | ☐ Pass ☐ Fail | |
| Interview Flow | ☐ Pass ☐ Fail | |
| Microphone Recording | ☐ Pass ☐ Fail | |
| Report Display | ☐ Pass ☐ Fail | |
| History Page | ☐ Pass ☐ Fail | |
| Error Handling | ☐ Pass ☐ Fail | |
| Mobile Responsive | ☐ Pass ☐ Fail | |
| Browser Compatibility | ☐ Pass ☐ Fail | |
