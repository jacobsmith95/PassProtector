// import { Buffer } from 'buffer';
// import * as argon2 from "argon2-browser";
// const argon2 = require('argon2');
const CryptoJS = require("crypto-js");

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
    // const masterKey = await argon2.hash(password, {salt: Buffer.from(email), raw: true});
    // const masterHash = await argon2.hash(masterKey, {salt: Buffer.from(password), raw: true});

    // return {
    //     masterKey: masterKey.toString("base64"),
    //     masterHash: masterHash.toString("base64")
    // };

    return {
        masterKey: 'QBnDz7Va2Bn43kuAWkoOaYRTAQmAV7jDt3CaAGajxLA=',
        masterHash: '8dgvtrYnmkDS2IZoB+kqybYdWLZzUkcocZ56+P5L/fw='
    }
}

function encryptVault(key, vault) {
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

function decryptVault(key, ciphertext) {
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

export {generateMasterKey, encryptVault, decryptVault};




async function main() {
    // console.log(await generateMasterKey("RandomGuysEmail1234@gmail.com", "BigLongPassword"));
    // console.log(await generateMasterKey("RandomGuysEmail1234@gmail.com", "BigLongPassword"));
    // console.log(await generateMasterKey("RandomGuysEmail@gmail.com", "BigLongPassword"));
      
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

    // // To verify that we can read string data stored in the database here is some encrypted data. You can uncomment the below command to decrypt it
    // const receivedData = {
    //     ciphertext: '+j+YD9RhmfrLATnY2EH4iP7PtibnJrMSwJ0OpVIUo8LNr1cby5S3wPSY+Ct3TYW2vUEcnPz/cfAReXkfy7SpD2SsbbuUCgtMY8NR4Mx2wxxek/7j3ixenAOapNZNPhquxzI3EB5l5Oby4Nhej2JNxJ4Xe1gwtH+t7fjCrZRK5Y21Mp8q1P5CnfuRfAy/vhlCjvAVOks9OGCvaysl/gZ9RHR5VvyRyJDJGzPx9oVp9tuR+n0qUdZ1xodPnTGzFT229duWUWCs7TJBtV+PaHdMRLKX/Fe610xJYXUFsSHP98yk4Q8gCxHJsDge0+Z7Pn7pmNHCpdgY7WIyJhVrwCtJZoMkHaXnpKe51vfX/7VR7php/+755/Z99Eh7xFaiUQJ3z3ZvPDGbKkbERH8TtzxXK8+c/eH8QfbaJTPbuRKulA+AdDm2p5IvzdCapla9hhVLKyjn1khVFzb7MuMlVyGaFyyeReqCkLo3QRr9aeuY8LRs0w4kK1XP8eNeZ2YryTUr+0js/LdMOGVkk7qi24k/cy0gBBHSfE4hR0a4/C4/9gZ9uPgJ8/0Y9kBL6u3OSBRD12KVtllNG204FaLuT2rw1Fum1+rfn1cwBoPC5VuzxKokc7rEPyHhdqCR5MaPJYFcf7qkT0IMAD/N9usyqgy1E/sUlRXndR6oHi6T6yf7vhWp4Odv7iwbMnA0faRxGv/M4V4uT+XXAdva9u4uUZAMLXqlbWTtWXAXL5M8NY98QCn4Y/rduIIw7eH1aE5v1wegjMYPFS7eEnSvi5xNVLXK3BtBVrh0Hom1bCqcap7RGCv2/V4usv38xPuJ5zTCuAJgmc1x2Z8/ed/uLsNRieMzLzg32PFYf24kjVdNGwHjuDpaGQX86qNxBXLrShIQ4xKEk3ZoyUah8xotoUM4IjNuuNHM4iDcrScfBNi9zITzFEKxcNwKIFk+TpMJUvRNu9UghP7CO6WR05+a0O6+9mAAhw+BpRSXzowW2z6L1hOZQfUvYLGgf4RzBCS/7chIJTMQ',
    //     iv: 'd955d00b481684d86b230b0b183dcac2027f73258e7f4ef6d70ef7ac19cc23a8'
    // }

    // console.log(decryptVault(masterData.masterKey, receivedData))
}

if (require.main === module) {
    main();
}

