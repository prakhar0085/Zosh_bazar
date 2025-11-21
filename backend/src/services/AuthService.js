const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOtp');
const VerificationCode = require('../models/VerificationCode');
const User = require('../models/User');
const Cart = require('../models/Cart');
const jwtProvider = require('../utils/jwtProvider');
const UserError = require('../exceptions/UserError');

class AuthService {
    async sendLoginOtp(email) {
        const SIGNING_PREFIX = "signing_";

        // console.log("email",email)

        if (email.startsWith(SIGNING_PREFIX)) {
            email = email.substring(SIGNING_PREFIX.length);
            const user = await User.findOne({ email }); 

            if(!user) throw new UserError("user not founed with email : "+email);
        }

        const existingVerificationCode = await VerificationCode.findOne({ email });

        if (existingVerificationCode) {
            await VerificationCode.deleteOne({ email });
        }

        const otp = generateOTP();
        const verificationCode = new VerificationCode({ otp, email });
        await verificationCode.save();

        const subject = "Zosh Bazaar Login/Signup OTP";
        const text = `Your login OTP is - ${otp}`;
        // console.log("email ------- ",email)
        await sendVerificationEmail(email, subject, text);
    }

    async createUser(req) {
        const { email, fullName, otp } = req;

        const verificationCode = await VerificationCode.findOne({ email });

        if (!verificationCode || verificationCode.otp !== otp) {
            throw new Error("Wrong OTP...");
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                fullName,
                role: 'ROLE_CUSTOMER', 
                mobile: "9083476123", 
                password: await bcrypt.hash(otp, 10) 
            });

            await user.save();

            const cart = new Cart({ user: user._id });
            await cart.save();
        }

        const token = jwtProvider.createJwt({email})

        return token;
    }

    async signin(req) {
        const { email, otp } = req;

        const user = await User.findOne({ email });

        console.log("user : ",user)

        if (!user) {
            throw new UserError("Invalid username or password");
        }

        const verificationCode = await VerificationCode.findOne({ email });

        if (!verificationCode || verificationCode.otp !== otp) {
            throw new Error("Wrong OTP...");
        }

        const token = jwtProvider.createJwt({email})

        return {
            message: "Login Success",
            jwt: token,
            role: user.role
        };
    }
}

module.exports = new AuthService();
