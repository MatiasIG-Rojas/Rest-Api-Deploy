import { Router } from "express";
import { MovieController } from "../controllers/movies.js";

export const createMovieRouter = ({ movieModel }) => {
    const moviesRouter = Router()

    const movieController = new MovieController({movieModel})

    // Listar películas
    moviesRouter.get('/', movieController.getAll)
    // Obtener una película por id
    moviesRouter.get('/:id', movieController.getById)
    // Crear una película
    moviesRouter.post('/', movieController.create)
    // Eliminar una película
    moviesRouter.delete('/:id', movieController.delete)
    // Actualizar una película
    moviesRouter.patch('/:id', movieController.update)  
    
    return moviesRouter
}

