import * as CryptoJS from "crypto-js";

export const generateMasterKey = (email, password) => {
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

    const iterations = 10000
    const masterKey = CryptoJS.PBKDF2(password, email, {
        iterations: iterations,
        keySize: 8,
        hasher: CryptoJS.algo.SHA256,
    })

    const masterHash = CryptoJS.PBKDF2(masterKey, password, {
        iterations: iterations,
        keySize: 8,
        hasher: CryptoJS.algo.SHA256,
    })

    return {
        masterKey: masterKey.toString(CryptoJS.enc.Base64),
        masterHash: masterHash.toString(CryptoJS.enc.Base64)
    };
}


export const encryptVault = (key, vault) => {

    /**
     * Vault encryption module
     * 
     * Arguments:
     *      key: Base64 encoded key, should use value generated by generateMasterKey()
     *      vault: JS object of users vault
     * 
     * Returns:
     *      JS object with the following fields:
     *          ciphertext: printable format of ciphertext
     *          iv: pseudorandom iv used for encryption
     * 
     * Note: Both items of the ciphertext are safe to transmit to the server
     */
    const vault_str = JSON.stringify(vault);
    const encoded_key = CryptoJS.enc.Base64.parse(key);
    const encoded_iv = CryptoJS.lib.WordArray.random(32);

    const enc = CryptoJS.AES.encrypt(vault_str, encoded_key, {
        iv: encoded_iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return {
        ciphertext: enc.toString(),
        iv: encoded_iv.toString(CryptoJS.enc.Hex),
    }
}

export const decryptVault = (key, ciphertext) => {

    /**
     * Vault decryption module
     * 
     * Arguments:
     *      key: Base64 encoded key, should use value generated by generateMasterKey()
     *      ciphertext: JS object of ciphertext
     * 
     * Returns:
     *      JS object of the users vault
     */
    const encoded_key = CryptoJS.enc.Base64.parse(key);
    const encoded_iv = CryptoJS.enc.Hex.parse(ciphertext.iv);

    const dec = CryptoJS.AES.decrypt(ciphertext.ciphertext, encoded_key, {
        iv: encoded_iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return JSON.parse(dec.toString(CryptoJS.enc.Utf8))
}

// export {generateMasterKey, encryptVault, decryptVault};

// function main() {
//     console.log(generateMasterKey("RandomGuysEmail1234@gmail.com", "BigLongPassword"));
//     console.log(generateMasterKey("RandomGuysEmail1234@gmail.com", "BigLongPassword"));
//     console.log(generateMasterKey("RandomGuysEmail@gmail.com", "BigLongPassword"));
      
    // var vault = {
    //     name: "Jackson",
    //     age: 24,
    //     color: "Blue"
    // }
    // console.log("vault = ", vault)


    // // Using our key generation, we can generate the master key
    // const masterData = await generateMasterKey("RandomGuysEmail1234@gmail.com", "BigLongPassword");

    // console.log(masterData)

    // // We can use the master key to encrypt our data
    // const ciphertext = encryptVault(masterData.masterKey, vault);
    // console.log("ciphertext = ", ciphertext)

    // // We can then use the ciphertext and the master key to decrypt our vault
    // const plaintext = decryptVault(masterData.masterKey, ciphertext)
    // console.log("plaintext = ", plaintext)

    // // Bad login attempt
    // const badMasterData = await generateMasterKey("RandomGuysEmail1234@gmail.com", "BigLongPasswords");
    // const badPlaintext = decryptVault(badMasterData.masterKey, ciphertext)
    // console.log("plaintext = ", badPlaintext)
// }

// if (require.main === module) {
//     main();
// }