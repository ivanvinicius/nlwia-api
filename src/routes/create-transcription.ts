import { createReadStream } from 'node:fs'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'

const paramsSchema = z.object({ videoId: z.string().uuid() })
const bodySchema = z.object({ prompt: z.string() })

/**
 * Cria a transcrição dos vídeos que já foram carregados para api (upload)
 * @param app
 */
export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (req, res) => {
    const { videoId } = paramsSchema.parse(req.params)
    const { prompt } = bodySchema.parse(req.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
    })

    const videoPath = video.path
    const audioReadStream = createReadStream(videoPath)

    try {
      const response = await openai.audio.transcriptions.create({
        file: audioReadStream,
        model: 'whisper-1',
        language: 'pt',
        response_format: 'json',
        temperature: 0,
        prompt,
      })

      const transcription = response.text

      await prisma.video.update({
        where: { id: videoId },
        data: { transcription },
      })

      return res.status(200).send({ transcription })
    } catch {
      return res
        .status(500)
        .send({ error: 'Something went wrong during transcription generation' })
    }
  })
}
