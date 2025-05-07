import { Router } from 'express'
import { body } from 'express-validator'
import { createAccount, getUser, getUserByHandle, login, updateProfile, uploadImage } from './handlers'
import { handleInputErrors } from './middleware/validation'
import { authenticate } from './middleware/auth'
const router = Router()

router.post('/auth/register',
    body('handle').notEmpty().withMessage('El handle es requerido'),
    body('email').isEmail().withMessage('El email no es valido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña es requerida o no cumple con los requisitos minimos'),
    body('name').notEmpty().withMessage('El nombre es requerido'),
    handleInputErrors,
    createAccount
)

router.post('/auth/login',
    body('email').isEmail().withMessage('El email no es valido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña es requerida'),
    handleInputErrors,
    login
)

router.get('/user', authenticate, getUser)

router.patch('/user',
    body('handle').notEmpty().withMessage('El handle es requerido'),
    body('description').notEmpty().withMessage('La descripción es requerida'),
    handleInputErrors,
    authenticate, 
    updateProfile
)

router.post('/user/image', authenticate, uploadImage)

router.get('/:handle', getUserByHandle)

export default router