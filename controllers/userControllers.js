import { uploadPicture } from "../middleware/uploadPictureMiddleware";
import User from "../models/User";
import { fileRemover } from "../utils/fileRemover";
const registerUser = async (req, res, next) => {
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

const loginUser = async (req, res, next) => {
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
const userProfile = async(req, res, next) => {
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
};
const updateProfile = async (req, res, next) => {
    try {
        let user = await User.findById(req.user._id);
        if(!user){
            throw new Error("Utente non trovato");
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if(req.body.password && req.body.password.lenght < 6){
            throw new Error("La lunghezza della password deve essere di almeno sei caratteri");
        } else if(req.body.password){
            user.password = req.body.password;
        }
        const updatedUserProfile = await user.save();
        res.json({
            _id: updatedUserProfile._id,
            avatar: updatedUserProfile.avatar,
            name: updatedUserProfile.name,
            email: updatedUserProfile.email,
            verified: updatedUserProfile.verified,
            admin: updatedUserProfile.admin,
            token: await updatedUserProfile.generateJWT(),
        })
    } catch (error) {
        next(error);
    }
};
const updateProfilePicture = async (req, res, next) => {
    try {
        const upload = uploadPicture.single('profilePicture');
        upload(req, res, async function(err){
            if(err){
                const error = new Error("Errore sconosciuto durante il carimento dell'immagine"+err.message);
                next(error);
            } else {
                if(req.file){
                    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
                        avatar: req.file.filename,
                    }, {new: true});
                    res.json({
                        _id: updatedUser._id,
                        avatar: updatedUser.avatar,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        verified: updatedUser.verified,
                        admin: updatedUser.admin,
                        token: await updatedUser.generateJWT(),
                    });
                } else {
                    let filename;
                    let updatedUser = await User.findById(req.user._id);
                    filename = updatedUser.avatar;
                    updatedUser.avatar = "";
                    await updatedUser.save();
                    fileRemover(filename);
                    res.json({
                        _id: updatedUser._id,
                        avatar: updatedUser.avatar,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        verified: updatedUser.verified,
                        admin: updatedUser.admin,
                        token: await updatedUser.generateJWT(),
                    });

                }
            }
        });
    } catch (error) {
        next(error);
    }
}
export {registerUser, loginUser, userProfile, updateProfile, updateProfilePicture};