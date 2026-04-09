import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Keep it simple for now as per user request
export const runtime = 'edge'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Minimal persona for the salon
    const prompt = `You are a premium hair stylist assistant. 
    Be warm, concise, and helpful. 
    User message: ${lastMessage}`

    const result = await model.generateContentStream(prompt)
    
    // Convert Gemini stream to a format useChat can consume (or just return text)
    // For now, let's keep it simple and return a standard response if streaming is too complex for this pivot
    const response = await model.generateContent(prompt)
    const text = response.response.text()

    return NextResponse.json({
      role: 'assistant',
      content: text
    })
  } catch (error: any) {
    console.error('Gemini Error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
