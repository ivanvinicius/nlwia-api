import { fastify } from 'fastify'

import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideo } from './routes/upload-video'
import { createTranscription } from './routes/create-transcription'

const app = fastify()

app.register(getAllPromptsRoute)
app.register(uploadVideo)
app.register(createTranscription)

app.listen({ port: 3333 }).then(() => console.log('Running'))
