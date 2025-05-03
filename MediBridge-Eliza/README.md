# MediBridge-Eliza

A medical assistant chatbot powered by Eliza and OpenAI.

## Features

- Medical chatbot with first aid assistance
- Real-time chat interface
- Integration with OpenAI for intelligent responses
- Common medical condition advice
- Emergency situation guidance

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

## Development

- Run in development mode with hot reload:
  ```bash
  npm run dev
  ```

- Run tests:
  ```bash
  npm test
  ```

## Project Structure

- `server.js` - Main server file
- `agents/` - Contains the Eliza agent
- `public/` - Frontend files (HTML, CSS, JavaScript)
- `.env` - Environment variables (create this file)

## Usage

1. The chatbot can help with:
   - First aid advice
   - General medical information
   - Emergency situations
   - Common medical conditions

2. For medical advice, simply describe your symptoms or ask your question.

## Security Notes

- Never commit your `.env` file
- Keep your API keys secure
- Use HTTPS in production
- Follow medical data privacy regulations 