import { FastifyInstance } from 'fastify'

import { prisma } from '../lib/prisma'

export async function getAllPromptsRoute(app: FastifyInstance) {
  app.get('/prompts', async (req, res) => {
    const prompts = await prisma.prompt.findMany()

    return res.status(200).send({ prompts })
  })
}
