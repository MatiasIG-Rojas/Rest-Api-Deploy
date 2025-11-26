import mysql from 'mysql2/promise'

const config = {
    host: 'switchback.proxy.rlwy.net',
    user: 'root',
    port: 39484,
    password: 'fBFnFOYzAIzbUcIdJsbrRxnVwiCvyBfC',
    database: 'railway',
    ssl: {
        rejectUnauthorized: false
    }
}

const connection = await mysql.createConnection(config)

export { connection }

export class MovieModel {
    static async getAll ({genre}){
        if (genre) {
            const lowerCaseGenre = genre.toLowerCase()

            const [genres] = await connection.query(
                'SELECT id, name FROM genre WHERE LOWER(name) = ?;', [lowerCaseGenre]
            )

        if (genres.length === 0) return []

        const [{id}] = genres
        // Ahora obtenemos todas las películas de ese género:
        // Películas filtradas por género incluyendo sus géneros
        const [movies] = await connection.query(
            `SELECT
                BIN_TO_UUID(m.id) AS id,
                m.title,
                m.year,
                m.director,
                m.duration,
                m.poster,
                m.rate,
                GROUP_CONCAT(g.name) AS genres
            FROM movie m
            INNER JOIN movie_genres mg ON mg.movie_id = m.id
            INNER JOIN genre g ON g.id = mg.genre_id
            WHERE mg.genre_id = ?
            GROUP BY m.id;`,
            [id]
        )

        // Convertimos "Action,Drama" → ["Action", "Drama"]
        return movies.map(movie => ({
            ...movie,
            genres: movie.genres.split(',')
        }))
    }

    // Si NO se filtra por género → obtener todas con sus géneros
    const [movies] = await connection.query(
        `SELECT
            BIN_TO_UUID(m.id) AS id,
            m.title,
            m.year,
            m.director,
            m.duration,
            m.poster,
            m.rate,
            GROUP_CONCAT(g.name) AS genres
        FROM movie m
        LEFT JOIN movie_genres mg ON mg.movie_id = m.id
        LEFT JOIN genre g ON g.id = mg.genre_id
        GROUP BY m.id;`
    )

    return movies.map(movie => ({
        ...movie,
        genres: movie.genres ? movie.genres.split(',') : []
    }))
    }

    static async getById ({id}){
        const [movies] = await connection.query(
            `SELECT
                BIN_TO_UUID(m.id) AS id,
                m.title,
                m.year,
                m.director,
                m.duration,
                m.poster,
                m.rate,
                GROUP_CONCAT(g.name) AS genres
            FROM movie m
            LEFT JOIN movie_genres mg ON mg.movie_id = m.id
            LEFT JOIN genre g ON g.id = mg.genre_id
            WHERE m.id = UUID_TO_BIN(?)
            GROUP BY m.id;`,
            [id]
            
        )

        if (movies.length === 0) return null

        const movie =  movies[0]
        return {
            ...movie,
            genres: movie.genres ? movie.genres.split(',') : []
        }
    }

    static async create ({input}){
        const {
            genre: genreInput, // genre is an array
            title,
            year,
            duration,
            director,
            poster,
            rate
        } = input

        const [uuidResult] = await connection.query('SELECT UUID() uuid;')
        const [{ uuid }] = uuidResult
        
        try {
            await connection.query(
                `INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN("${uuid}"),?, ?, ?, ?, ?, ?);`,
                [title, year, director, duration, poster, rate]
            )
        } catch (e) {
            throw new Error('Error creating movie')
        }
    
        const [movies] = await connection.query(
            `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate
            FROM movie WHERE id = UUID_TO_BIN(?);
            `,
            [uuid]
        )

        return movies[0]
    }

    static async delete({ id }) {
        const [result] = await connection.query(
            'DELETE FROM movie WHERE id = UUID_TO_BIN(?);',
            [id]
        )

        // result.affectedRows indica si se eliminó algo
        return result.affectedRows > 0
    }

    static async update({ id, input }) {
        // Construimos dinámicamente los campos a actualizar
        const fields = []
        const values = []

        for (const key in input) {
            fields.push(`${key} = ?`)
            values.push(input[key])
        }

        // Si no hay campos, no hacemos nada
        if (fields.length === 0) return false

        // Agregamos el id como último parámetro
        values.push(id)

        const [result] = await connection.query(
            `UPDATE movie SET ${fields.join(', ')} WHERE id = UUID_TO_BIN(?);`,
            values
        )

        return result.affectedRows > 0
    }
}