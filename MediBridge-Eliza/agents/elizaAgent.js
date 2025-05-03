const OpenAI = require('openai');

class ElizaAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.medicalKnowledge = {
      firstAid: {
        burns: "For minor burns, cool the burn under cool running water for 10-15 minutes. Cover with a sterile non-stick dressing. Seek medical attention for severe burns.",
        cuts: "Clean the wound with water, apply pressure to stop bleeding, and cover with a sterile dressing. Seek medical help for deep or heavily bleeding wounds.",
        choking: "For conscious adults, perform the Heimlich maneuver. For unconscious victims, begin CPR. Call emergency services immediately.",
        heartAttack: "Call emergency services immediately. Have the person sit down and rest. If they have prescribed medication, help them take it.",
        stroke: "Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Call 911 immediately if you notice these symptoms."
      },
      commonConditions: {
        fever: "Rest, stay hydrated, and take fever-reducing medication if appropriate. Seek medical attention if fever is high or persists.",
        headache: "Rest in a quiet, dark room. Stay hydrated. Consider over-the-counter pain relief if appropriate.",
        nausea: "Stay hydrated with small sips of water. Rest and avoid strong smells. Seek medical attention if vomiting persists."
      }
    };
  }

  async processQuery(userInput) {
    try {
      // First check if it's a first aid or common condition query
      const immediateResponse = this.checkImmediateResponse(userInput);
      if (immediateResponse) {
        return immediateResponse;
      }

      // If not an immediate response, use GPT for more complex queries
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a medical assistant chatbot. Provide helpful, accurate medical information while 
            emphasizing that you are not a substitute for professional medical advice. For serious conditions, 
            always recommend seeking professional medical help.`
          },
          {
            role: "user",
            content: userInput
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error processing Eliza query:', error);
      return "I apologize, but I'm having trouble processing your request. Please try again or consult a medical professional for immediate assistance.";
    }
  }

  checkImmediateResponse(userInput) {
    const lowerInput = userInput.toLowerCase();
    
    // Check for first aid situations
    for (const [condition, advice] of Object.entries(this.medicalKnowledge.firstAid)) {
      if (lowerInput.includes(condition)) {
        return `For ${condition}, here's what you should do: ${advice}\n\nRemember, this is general advice. For serious conditions, always call emergency services immediately.`;
      }
    }

    // Check for common conditions
    for (const [condition, advice] of Object.entries(this.medicalKnowledge.commonConditions)) {
      if (lowerInput.includes(condition)) {
        return `For ${condition}, here are some general recommendations: ${advice}\n\nIf symptoms persist or worsen, please consult a healthcare professional.`;
      }
    }

    return null;
  }
}

module.exports = { ElizaAgent }; 