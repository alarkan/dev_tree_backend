import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'

declare global {
    namespace Express {
        interface Request {
            user: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        return res.status(401).send('No autorizado')
    }
    const [, token] = bearer.split(' ')
    if (!token) {
        return res.status(401).send('No autorizado')
    }
    try {
        const result = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof result === 'object' && result.id) {
            const user = await User.findById(result.id).select('-password')
            if (!user) {
                return res.status(401).send('No autorizado, el usuario no existe')
            }
            req.user = user
            next()
        }
    } catch (error) {
        return res.status(401).send('Token no valido')

    }
}