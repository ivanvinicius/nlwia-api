import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

const bodySchema = z.object({ title: z.string(), template: z.string() })

/**
 * Cria novos prompts
 * @param app
 */
export async function createPromptRoute(app: FastifyInstance) {
  app.post('/prompts', async (req, res) => {
    const { title, template } = bodySchema.parse(req.body)

    const promptExists = await prisma.prompt.findFirst({ where: { title } })

    if (promptExists) {
      return res.status(400).send({ error: 'Prompt already exists' })
    }

    const prompt = await prisma.prompt.create({ data: { title, template } })

    return res.status(200).send({ prompt })
  })
}
