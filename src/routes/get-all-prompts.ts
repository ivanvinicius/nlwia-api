import { FastifyInstance } from 'fastify'

import { prisma } from '../lib/prisma'

/**
 * Busca todos os promts cadastrados
 * @param app
 */
export async function getAllPromptsRoute(app: FastifyInstance) {
  app.get('/prompts', async (req, res) => {
    const prompts = await prisma.prompt.findMany()

    return res.status(200).send({ prompts })
  })
}
