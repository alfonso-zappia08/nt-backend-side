import User from "../models/User";
export const registerUser = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;
        let user = await User.findOne({email});
        if(user){
           throw new Error("Che fai? Sei già registrato!");
        }
        user = await User.create({
            name, email, password,
        });
        return res.status(201).json({
            _id: user._id,
            avatar: user.avatar,
            name: user.name,
            email: user.email,
            verified: user.verified,
            admin: user.admin,
            token: await user.generateJWT(),
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
       const {email, password} = req.body; 
       let user = await User.findOne({email});
       if(!user){
        throw new Error("Email non trovata");
       }
       if(await user.comparePassword(password)){
        return res.status(201).json({
            _id: user._id,
            avatar: user.avatar,
            name: user.name,
            email: user.email,
            verified: user.verified,
            admin: user.admin,
            token: await user.generateJWT(),
        });
       } else {
        throw new Error("Email o password non validi");
       }
    } catch (error) {
        next(error);
    }
}
export const userProfile = async(req, res, next) => {
    try {
        let user = await User.findById(req.user._id);
        if(user){
            return res.status(201).json({
                _id: user._id,
                avatar: user.avatar,
                name: user.name,
                email: user.email,
                verified: user.verified,
                admin: user.admin,
            }); 
        } else {
            let error = new Error("Utente non trovato");
            error.statusCode = 404;
            next(error);
        }
    } catch (error) {
        next(error);
    }
}
export {registerUser, loginUser};