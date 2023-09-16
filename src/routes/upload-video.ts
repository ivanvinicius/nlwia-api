import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { createWriteStream } from 'node:fs'
import { FastifyInstance } from 'fastify'
import { fastifyMultipart } from '@fastify/multipart'

import { prisma } from '../lib/prisma'

/**
 * É necessário usar o promisify para converter funções do NodeJS que ainda não
 * usam o padrão de promises ou seja, callback functions
 */
const pipe = promisify(pipeline)

/**
 * Realiza o upload dos vídeos para o disco. Lembrando que, o arquivo presente aqui
 * na verdade é o áudio extraído do vídeo, dessa maneira conseguimos reduzir
 * drasticamente o tamanho do arquivo, e consequentemente o tempo de req e res
 * @param app
 */
export async function uploadVideoRoute(app: FastifyInstance) {
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
