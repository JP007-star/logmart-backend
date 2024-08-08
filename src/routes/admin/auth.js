const express=require('express')
const {signup, signin,signout, getAllUsers, getOneUserByUsername, updateUser, updatePassword, viewCurrentPassword}=require('../../controllers/admin/auth')
const { validateSignInRequest, isRequestValidated, validateSignUpRequest } = require('../../validators/auth')
const {requireSigin} = require('../../middleware/index')
const router=express.Router()



router.post('/admin/signin',validateSignInRequest,isRequestValidated, signin)
router.post('/admin/signup',validateSignUpRequest,isRequestValidated,signup)
router.post('/admin/signout',signout)
router.get('/admin/users', getAllUsers);
router.get('/admin/users/:username', getOneUserByUsername);
router.put('/admin/users/:userId', updateUser);
router.put('/admin/users/:userId/update-password', updatePassword); 


module.exports =router