import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { createWriteStream } from 'node:fs'
import { FastifyInstance } from 'fastify'
import { fastifyMultipart } from '@fastify/multipart'

import { prisma } from '../lib/prisma'

const pipe = promisify(pipeline)

export async function uploadVideo(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25mb
    },
  })

  app.post('/videos', async (req, res) => {
    const data = await req.file()

    if (!data) {
      return res.status(400).send({ error: 'Missing file' })
    }

    const extension = path.extname(data.filename)

    if (extension !== '.mp3') {
      return res.status(400).send({ error: 'Invalid file type, upload a mp3' })
    }

    const fileBaseName = path.basename(data.filename, extension)
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
    const uploadDestination = path.resolve(
      __dirname,
      '../../tmp/uploads',
      fileUploadName,
    )

    await pipe(data.file, createWriteStream(uploadDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    })

    return res.status(201).send({ video })
  })
}
