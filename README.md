# ArgumentAce 🎯

**Master the art of debate with AI-powered practice and feedback**

ArgumentAce is an intelligent debate training platform that helps users improve their argumentation skills through AI-powered practice sessions, real-time feedback, and structured debate formats.

## 🚀 Features

### Core Functionality
- **AI Debate Partner**: Practice debates with an intelligent AI opponent that adapts to your skill level
- **Real-time Feedback**: Get instant analysis of your arguments with suggestions for improvement
- **Multiple Debate Formats**: Support for Asian Parliamentary, British Parliamentary, and Standard formats
- **Speech Recognition**: Voice-to-text input for natural debate practice
- **Text-to-Speech**: AI responses with natural voice synthesis

### Advanced Features
- **Research Assistant**: Get background information and key points on any debate topic
- **Jury Verdict**: Comprehensive evaluation of your debate performance
- **Point of Information (POI)**: Interactive questioning system during debates
- **Session Management**: Save and resume debate sessions
- **Preparation Mode**: Structured prep time for formal debate formats

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **AI Integration**: Google Gemini API for argument generation and analysis
- **Speech Services**: Sarvam AI for text-to-speech and speech-to-text
- **State Management**: React hooks with local storage persistence

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/argumentace.git
   cd argumentace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SARVAM_API_KEY=your_sarvam_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Use

1. **Start a Debate**: Enter a topic and select your skill level
2. **Choose Format**: Pick from Standard, Asian Parliamentary, or British Parliamentary
3. **Prepare** (for formal formats): Use the preparation phase to research and plan
4. **Debate**: Exchange arguments with the AI, getting real-time feedback
5. **Get Verdict**: Request a comprehensive evaluation of your performance

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature-specific components
├── ai/                 # AI integration and flows
├── services/           # External service integrations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── config/             # Configuration files
```

## 🤝 Contributing

This project was built for a hackathon. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Sarvam AI for speech services
- Radix UI for component primitives
- The debate community for format specifications

---

Built with ❤️ for the hackathon