import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'

import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-video'
import { createTranscriptionRoute } from './routes/create-transcription'
import { generateIACompletionRoute } from './routes/generate-ia-completion'

const app = fastify()

app.register(fastifyCors, { origin: '*' }) // cors

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateIACompletionRoute)

app.listen({ port: 3333 }).then(() => console.log('api running'))
