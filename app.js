import express, { json } from 'express' // require -> commonJS
import { createMovieRouter } from './routes/movies.js' // import -> ESModules
import { corsMiddleware } from './middlewares/cors.js'

export const createApp = ({movieModel}) => {
  const app = express()
  app.use(json())
  app.use(corsMiddleware())
  app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express

  app.use('/movies', createMovieRouter({movieModel}))

  const PORT = process.env.PORT ?? 3000

  app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
  })
}
