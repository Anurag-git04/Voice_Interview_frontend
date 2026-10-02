# AI Voice Interview Coach - Frontend

A Next.js application for practicing job interviews with AI-powered feedback and speech analysis.

## Features

- 🎤 **Voice Recording**: Push-to-talk microphone recording
- 🤖 **AI Feedback**: Real-time evaluation with detailed scoring
- 📊 **Speech Metrics**: WPM, filler words, pauses analysis
- 📈 **Progress Tracking**: Historical performance charts
- 📱 **Mobile Friendly**: Responsive design for all devices
- 🎯 **Customizable**: Choose role, level, and interview type

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **API Client**: Fetch API with TypeScript types

## Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running on `http://localhost:8000` (or configured URL)

## Installation

1. **Clone the repository** (if not already done)

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing/setup page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── interview/[id]/
│   │   └── page.tsx              # Interview session page
│   ├── report/[id]/
│   │   └── page.tsx              # Interview report page
│   └── history/
│       └── page.tsx              # Session history page
├── components/                   # Reusable components
│   ├── MicButton.tsx            # Push-to-talk recording button
│   └── FeedbackCard.tsx         # Evaluation display component
├── lib/
│   └── api.ts                   # API client with TypeScript types
├── public/                       # Static assets
└── package.json                 # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the backend API with these endpoints:

| Method | Endpoint                | Purpose                  |
| ------ | ----------------------- | ------------------------ |
| POST   | `/sessions`             | Create interview session |
| POST   | `/sessions/{id}/answer` | Submit audio/text answer |
| GET    | `/sessions/{id}`        | Get session details      |
| GET    | `/sessions/{id}/report` | Get final report         |
| GET    | `/sessions`             | List all sessions        |
| GET    | `/health`               | Health check             |

See `lib/api.ts` for full TypeScript definitions.

## Components

### MicButton

Push-to-talk microphone recording component with:

- Mouse press/release support
- Touch start/end support for mobile
- Permission handling
- Visual recording state

### FeedbackCard

Displays evaluation results with:

- Overall score badge
- Score breakdown (4 metrics)
- Speech metrics
- Strengths and improvements
- Sample answer

## Pages

### Landing Page (/)

- Interview configuration form
- Backend health check
- Role, level, type selection
- Question count input

### Interview Page (/interview/[id])

- Question display
- Text-to-speech for questions
- Microphone recording
- Real-time feedback
- Progress tracking

### Report Page (/report/[id])

- Overall performance score
- Speech metrics summary
- Key strengths
- Areas for improvement
- Question-by-question breakdown

### History Page (/history)

- Session list
- Performance trend chart
- Statistics cards
- Quick navigation

## Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (iOS requires HTTPS for microphone)
- ⚠️ Internet Explorer (Not supported)

## Microphone Requirements

- **HTTPS required** in production (localhost works in dev)
- User must grant microphone permission
- Recording format: WebM or MP4 (browser-dependent)

## Environment Variables

| Variable              | Description     | Default                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

Quick test:

1. Start backend server
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Complete an interview session
5. View report and history

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set root directory to `frontend`
   - Add environment variable:
     - `NEXT_PUBLIC_API_URL`: Your production backend URL

3. **Deploy**
   - Vercel will automatically build and deploy
   - Get your live URL

### Other Platforms

The frontend is a standard Next.js app and can be deployed to:

- Netlify
- AWS Amplify
- Azure Static Web Apps
- Self-hosted with Node.js

## Troubleshooting

### Backend connection error

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Verify CORS settings allow your frontend origin

### Microphone not working

- Check browser permissions
- Use HTTPS (required in production)
- Try a different browser

### Build errors

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version is 20+

### Chart not displaying

- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors

## Known Issues

1. **Cold starts**: Backend may take time on first request
2. **TTS quality**: Varies by browser/OS
3. **WebM format**: Some browsers use different codecs

## Future Enhancements

- [ ] Offline support with service workers
- [ ] Local storage for draft answers
- [ ] Export report as PDF
- [ ] Share report via link
- [ ] Video recording support
- [ ] Multi-language support
- [ ] Dark mode theme

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues and questions:

- Check the [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- Review browser console for errors
- Verify backend connectivity

---

**Built with ❤️ using Next.js and TypeScript**
