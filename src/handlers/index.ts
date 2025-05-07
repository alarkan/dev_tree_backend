import type { Request, Response } from 'express'
import slugify from 'slugify'
import User from '../models/User'
import { hashPassword, checkPassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';
import cloudinary from '../config/cloudinary';
import formidable from 'formidable';

export const createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body
    const userExist = await User.findOne({ email })
    if (userExist) {
        return res.status(400).send('El usuario ya existe')
    }
    const handle = slugify(req.body.handle, '')
    const handleExist = await User.findOne({ handle })
    if (handleExist) {
        return res.status(400).send('El handle ya existe')
    }
    const user = new User(req.body)
    user.handle = handle
    user.password = await hashPassword(password)
    await user.save()
    res.status(200).send('registro exitoso');
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    const userExist = await User.findOne({ email })
    if (!userExist) {
        return res.status(400).send('El usuario no existe')
    }
    const isPasswordCorrect = await checkPassword(password, userExist.password)
    if (!isPasswordCorrect) {
        return res.status(400).send('La contraseña es incorrecta')
    }

    const token = generateJWT({ id: userExist._id })
    res.status(200).send({ token: token, mensaje: 'Login exitoso' });
}

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description, links } = req.body
        const handle = slugify(req.body.handle, '')
        const handleExist = await User.findOne({ handle })
        if (handleExist && handleExist.email !== req.user.email) {
            return res.status(400).send('Nombre de usuario no disponible')
        }
        req.user.handle = handle
        req.user.description = description
        req.user.links = links
        await req.user.save()
        res.status(200).send('Perfil actualizado')
    } catch (error) {
        res.status(500).send('Error al actualizar el perfil')
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    const form = formidable({ multiples: false })
    try {
        form.parse(req, async (err, fields, files) => {
            cloudinary.uploader.upload(files.file[0].filepath, { public_id: `file_${Date.now()}` }, async (error, result) => {
                if (error) {
                    return res.status(500).send('Error al subir la imagen')
                }
                if (result) {
                    req.user.image = result.secure_url
                    await req.user.save()
                    res.json({ image: result.secure_url })
                }
            })
        })
    } catch (error) {
        return res.status(500).send('Error al subir la imagen')
    }
}

export const getUserByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.params
        const userExist = await User.findOne({ handle }).select('-password -__v -email -_id')
        if (!userExist) {
            return res.status(400).send('El usuario no existe')
        }
        res.json(userExist)
    } catch (error) {
        return res.status(500).send('Error al subir la imagen')
    }
}