import { createReadStream } from 'node:fs'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'

export async function generateIACompletion(app: FastifyInstance) {
  app.post('', async (req, res) => {
    return res.status(200).send({ ok: true })
  })
}
