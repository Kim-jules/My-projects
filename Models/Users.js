const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');
const validator = require('validator')



const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isValidEmail, 'Invalid email address']
  },
  isEmailVerified: {
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: String,
  phoneNumber: {
    type: String,
    required: true,
    validate: [isValidPhoneNumber, 'Invalid phone number']
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }
  ],
  isLocked: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  twoFactorSecret: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//Validating Email
// Custom validator function for email
function isValidEmail(email) {
  return validator.isEmail(email);
}

//validating phone number
function isValidPhoneNumber(phoneNumber) {
  // Use validator's isMobilePhone function for basic phone number validation
  return validator.isMobilePhone(phoneNumber, 'any', { strictMode: false });
}

//Validating and Encrypting or Hashing your password field
const passwordSchema = new passwordValidator();
passwordSchema
  .is().min(8)                                // Minimum length 8
  .has().uppercase()                          // Must have uppercase letters
  .has().lowercase()                          // Must have lowercase letters
  .has().digits()                             // Must have digits
  .has().symbols();                           // Must have symbols


UserSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  // Validate the password against the schema
  if (!passwordSchema.validate(user.password)) {
    const error = new Error('Password does not meet the criteria.');
    return next(error);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;

  next();
});



module.exports = {
  User: mongoose.model('User', UserSchema),
  passwordSchema: passwordSchema,
  isValidEmail: isValidEmail,
  isValidPhoneNumber: isValidPhoneNumber
  
};