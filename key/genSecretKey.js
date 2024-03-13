const crypto = require('crypto');

const genSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString('hex')
    console.log(secretKey);
}

genSecretKey();