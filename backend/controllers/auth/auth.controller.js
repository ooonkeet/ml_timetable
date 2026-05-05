import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/auth/user.model.js';

const register = async (req, res) => {
    const { role, password } = req.body;
    try {
        const ispresent = await User.findOne({ role })
        if (ispresent) {
            return res.status(400).json({
                success: false,
                message: "role already exists"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);
        const newuser = new User({ role, password: hashpassword });
        await newuser.save();
        if (newuser) {
            return res.status(200).json({
                success: true,
                message: 'Registtration succesfull'
            })
        } else {
            return res.status(400).json({
                success: false,
                message: 'Registration failed'

            })
        }



    } catch (error) {

        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'registration failed due to internal server error'

        })

    }

}

const login = async (req, res) => {
    const { role, password } = req.body;
    try {
        const user = await User.findOne({ role })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "role not found! please try with correct detalis"
            })
        }

        const bearer = await bcrypt.compare(password, user.password)
        // console.log(pass)
        if (!bearer) {
            return res.status(400).json({
                success: false,
                message: "wrong password"
            })
        }
        const token = jwt.sign({
            id: user._id,
            role
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: '30m'
        })
        return res.status(200).json({
            success: true,
            data: token
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'log in failed due to internal server error'

        })
    }


}
export { login, register };