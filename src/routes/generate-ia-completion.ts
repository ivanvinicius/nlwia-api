import { FastifyInstance } from 'fastify'
import { OpenAIStream, streamToResponse } from 'ai'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'

const bodySchema = z.object({
  videoId: z.string().uuid(),
  prompt: z.string(),
  temperature: z.number().min(0).max(1).default(0.5),
})

/**
 * Gera a transcrição dos vídeos, através do prompt informado no front-end
 * @param app
 */
export async function generateIACompletionRoute(app: FastifyInstance) {
  app.post('/ai/complete', async (req, res) => {
    const { videoId, prompt, temperature } = bodySchema.parse(req.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
    })

    if (!video.transcription) {
      return res
        .status(400)
        .send({ error: 'Video transcription was not generated yet' })
    }

    const promptMessage = prompt.replace('{transcription}', video.transcription)

    /**
     * Dependendo do tamanho da transcrição é possível mudar os modelos da openAI
     * Existe um site chamado Tokenizer para verificar essa questão, lá é possível
     * ver quantos tokens a requisação vai precisar. Lembrando, req e res somados.
     * */
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-16k',
        temperature,
        messages: [{ role: 'user', content: promptMessage }],
        stream: true,
      })

      const stream = OpenAIStream(response)

      /**
       * Permite que uma resposta no formate de strem seja formda. É necessário
       * configurar o CORS seperadamente, bem como passar o módulo raiz de respostas
       * do NODEJS, que é o res.raw
       */
      streamToResponse(stream, res.raw, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
        },
      })
    } catch {
      return res
        .status(500)
        .send({ error: 'Something went wrong during completion generation' })
    }
  })
}
