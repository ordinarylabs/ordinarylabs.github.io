import init, { generate_fingerprint, generate_dh_keys, encrypt_dh, decrypt_dh, } from "./rgp-web/rgp_web.js";

(async () => {
    console.log("sup. if you'd like to be cool and use e2ee in your own app, check out https://www.npmjs.com/package/rgp-web.");

    await init();
    
    const genSigningKeyBtn = document.getElementById('gen-signing-keys');
    const signingKeysDest = document.getElementById('signing-keys');

    genSigningKeyBtn.addEventListener('click', () => {
        const signingKeys = generate_fingerprint();

        const signingKey = JSON.stringify([...signingKeys.fingerprint]);
        const verifyingKey = JSON.stringify([...signingKeys.verifier]);

        signingKeysDest.innerHTML = `
            <p>private signing key: <strong>${signingKey}</strong></p>
            <p>public verifying key: <strong>${verifyingKey}</strong></p>
        `;
    });

    const genExchangeKeyBtn = document.getElementById('gen-exchange-keys');
    const exchangeKeysDest = document.getElementById('exchange-keys');

    genExchangeKeyBtn.addEventListener('click', () => {
        const exchangeKeys = generate_dh_keys();

        const privateKey = JSON.stringify([...exchangeKeys.private]);
        const publicKey = JSON.stringify([...exchangeKeys.public]);

        exchangeKeysDest.innerHTML = `
            <p>private exchange key: <strong>${privateKey}</strong></p>
            <p>public exchange key: <strong>${publicKey}</strong></p>
        `;
    });

    const encryptForm = document.getElementById('encrypt-form');
    const encryptedMsgDest = document.getElementById('encrypted-message');

    encryptForm.addEventListener('submit', (event) => {
        event.preventDefault();

        let signingKey = encryptForm.elements['encrypt-signing-key'].value;
        let privateKey = encryptForm.elements['encrypt-private-key'].value;
        let publicKey = encryptForm.elements['encrypt-public-key'].value;

        signingKey = new Uint8Array(JSON.parse(signingKey));
        privateKey = new Uint8Array(JSON.parse(privateKey));
        publicKey = new Uint8Array(JSON.parse(publicKey));

        const message = encryptForm.elements['encrypt-message'].value;

        const encoder = new TextEncoder();
        const content = encoder.encode(message);

        const encryptedContent = JSON.stringify([...encrypt_dh(
            signingKey,
            content,
            privateKey,
            publicKey,
        )]);

        encryptedMsgDest.innerHTML = `
            <p>encrypted message: <strong>${encryptedContent}</strong></p>
        `;
    });

    const decryptForm = document.getElementById('decrypt-form');
    const decryptedMsgDest = document.getElementById('decrypted-message');

    decryptForm.addEventListener('submit', (event) => {
        event.preventDefault();

        let verifyingKey = decryptForm.elements['decrypt-verifying-key'].value;
        let publicKey = decryptForm.elements['decrypt-public-key'].value;
        let privateKey = decryptForm.elements['decrypt-private-key'].value;

        verifyingKey = new Uint8Array(JSON.parse(verifyingKey));
        privateKey = new Uint8Array(JSON.parse(privateKey));
        publicKey = new Uint8Array(JSON.parse(publicKey));

        let message = decryptForm.elements['decrypt-message'].value;
        message = new Uint8Array(JSON.parse(message));

        const decryptedContent = decrypt_dh(
            0,
            message,
            verifyingKey,
            publicKey,
            privateKey,
        );

        const decoder = new TextDecoder();

        decryptedMsgDest.innerHTML = `
            <p>decrypted message: <strong>${decoder.decode(decryptedContent)}</strong></p>
        `;
    });
})();
