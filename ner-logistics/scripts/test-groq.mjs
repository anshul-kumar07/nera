import Groq from 'groq-sdk'

const apiKey = process.env.GROQ_API_KEY || ''
if (!apiKey) {
  console.warn('GROQ_API_KEY environment variable not set. Please provide it before running.')
}

const groq = new Groq({ apiKey })

async function main() {
  const modelsToTry = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'groq/compound']
  for (const model of modelsToTry) {
    try {
      console.log(`Testing model: ${model}...`)
      const res = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Suggest an alternate route for NH-37 in Assam in valid JSON: {"route": "NH-27"}' }],
        response_format: { type: 'json_object' }
      })
      console.log(`SUCCESS with ${model}:`, res.choices[0].message.content)
      return model
    } catch (e) {
      console.log(`Failed ${model}:`, e instanceof Error ? e.message : String(e))
    }
  }
}

main()

