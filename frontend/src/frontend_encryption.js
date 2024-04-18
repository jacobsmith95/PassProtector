const argon2 = require('argon2');
// const CryptoJS = require("crypto-js");

async function generateMasterKey(email, password) {
    /**
     * Generates masterKey and masterHash from an email and password string
     * 
     * Arguments:
     *      email: email address in string form
     *      password: master password in string form
     * 
     * Return:
     *      JS Object with the fields (encoded in base64):
     *          masterKey: master key used for encrypting/decrypting vault
     *          masterHash: master hash used for account authentication
     * 
     * Note: It is safe to transmit the master hash for validation but
     * 
     *                 DO NOT TRANSMIT THE MASTER KEY!!!
     * 
     * The master key should never leave the application process in order to maintain vault security
     */
    const masterKey = await argon2.hash(password, {salt: Buffer.from(email), raw: true});
    const masterHash = await argon2.hash(masterKey, {salt: Buffer.from(password), raw: true});

    return {
        masterKey: masterKey.toString("base64"),
        masterHash: masterHash.toString("base64")
    };
}




async function main() {
    console.log(await generateMasterKey("RandomGuysEmail1234@gmail.com", "BigLongPassword"));
    console.log(await generateMasterKey("RandomGuysEmail1234@gmail.com", "BigLongPassword"));
    console.log(await generateMasterKey("RandomGuysEmail@gmail.com", "BigLongPassword"));
}

if (require.main === module) {
    main();
}

