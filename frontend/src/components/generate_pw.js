/*
Notes:
- Consider changing to something that could be easier to remember. 
*/

export const GeneratePW = () => {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&'()*+,-./:;<=>?@[]^_`{|}~";
        let pw = "";
        const randomArray = new Uint8Array(20);
        crypto.getRandomValues(randomArray);

        randomArray.forEach((number) => {
            pw += chars[number % chars.length];
        });
        return pw;
}