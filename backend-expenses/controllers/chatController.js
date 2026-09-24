const { GoogleGenerativeAI } = require("@google/generative-ai")
const asyncHandler = require("express-async-handler")
const Conversation = require("../models/conversationSchema")

const handleChat = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { message, context } = req.body
    if (!message || message.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Please provide a message"
        });
    }
    if (message.length > 2000) {
        return res.status(400).json({
            success: false,
            message: "Message too long (max 2000 characters)"
        });
    }
    try {
        let conversation = await Conversation.findOne({ where: { userId } })
        if (!conversation) {
            conversation = new Conversation({
                userId,
                messages: []
            })
        }

        let financialInfo = "";
        if (context) {
            const { income, expenses, balance, savings, monthCategories} = context;
            let categoriesInfo = "";
            if (context.monthCategories && context.monthCategories.length > 0) {
                categoriesInfo = context.monthCategories.map(cat => `${cat.cat}: $${cat.amount} (${cat.expensePercentage}%)`).join(", ");
            }
            financialInfo = `
            USER'S FINANCIAL DATA:
            💰 Income: $${income}
            💸 Expenses: $${expenses}
            💰 Balance: $${balance}
            💎 Savings: $${savings}
            Monthly Categories: ${categoriesInfo}
            
            ANALYSIS:
            - Savings Rate: ${income > 0 ? ((savings / income) * 100).toFixed(1) : 0}%
            - Expense Ratio: ${income > 0 ? ((expenses / income) * 100).toFixed(1) : 0}%
            - Financial Health: ${balance > 0 ? 'Positive' : 'Needs Attention'}
            
            Give PERSONALIZED advice based on these real numbers!
            `;
        }

        const systemMessage = {
            role: 'system',
            content: `
                    Role: You are MoneyMate, a practical and savvy personal finance assistant.
                    Context: 
                    - User's Financial Status: ${financialInfo}

                    CRITICAL INSTRUCTIONS (Read carefully):
                    1. **NO REPETITION:** Do NOT start your response with "Wow," "Great job," or a summary of their total savings unless they specifically ask for a status update.
                    2. **ANSWER FIRST:** Address the user's specific question immediately. 
                    - If they ask about "Buying a Bike," look at their *Savings Balance* and tell them strictly if they can afford it (e.g., "You have $63k saved, so you can definitely buy a bike cash.").
                    - If they ask "How to budget," look at their *Expenses* and suggest a category to cut.
                    3. **BE NATURAL:** Speak like a human, not a generated report. Vary your openers.
                    4. **USE DATA SPARINGLY:** Only cite numbers that solve the specific problem asked.

                    Goal:
                    Provide a 2-sentence solution that is direct and helpful. 

                    Example of correct behavior:
                    User: "Can I buy a bike?"
                    Bot: "Definitely! You currently have **$63,930** in savings, so you can easily purchase a bike without denting your financial security. Go for it! 🚲
                    `
        }
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemMessage.content
        });
        const history = (conversation.messages || [])
            .slice(-10)
            .filter(m => m.role === "user" || m.role === "assistant")
            .map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
            }));
        const chat = model.startChat({
            history,
            generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
        });
        const result = await chat.sendMessage(message);
        const answer = result.response.text();
        await conversation.addMessage('user', message)
        await conversation.addMessage('assistant', answer)
        console.log(`💾 Saved. Total messages: ${conversation.messages.length}`);
        res.status(200).json({
            success: true,
            answer: answer
        })

    }
    catch (error) {
        console.error('❌ Chat Error:', error);
        
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                answer: "Too many requests. Please wait a moment."
            });
        }
        
        if (error.status === 401) {
            return res.status(500).json({
                success: false,
                answer: "API authentication error. Please contact support."
            });
        }
        
        res.status(500).json({
            success: false,
            answer: "Sorry, I'm having trouble right now. Please try again later."
        });

    }
})

module.exports = { handleChat }