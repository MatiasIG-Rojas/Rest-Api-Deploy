const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required'
    }), 
    year: z.number().int().positive().min(1900).max(2025),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).optional(),
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Fantasy', 'Documentary', 'Thriller', 'Crime', 'Adventure', 'Romance', 'Animation', 'Biography']),
        {
        required_error: 'Movie genre is required',
        invalid_type_error: 'Genre must be an array of enum genre'
        }
    )
})

function validateMovie(input) {
    return movieSchema.safeParse(input)
}

function validatePartialMovie(input) {
    return movieSchema.partial().safeParse(input)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}   