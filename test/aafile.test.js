const util=  require('ethereumjs-util');
const didcontract = artifacts.require('dids');
const Bitcore = require('bitcore-lib');
const etherWallet = require('ethereumjs-wallet');
const console = require('console');
const Web3 = require('web3');
const keyth = require('keythereum');
const {ethers} = require('ethers');
const Cryp = require('eth-crypto');
const { assert } = require('console');
const { arrayify, recoverPublicKey, hashMessage } = require('ethers/lib/utils');

contract('aa', function(accounts){
    beforeEach(async() => {
        obj = await didcontract.new({from: accounts[0]});
    })

    function prettier(ddoc){
        let ddoc2 = Object.assign({}, ddoc)
        delete ddoc2[0];
        delete ddoc2[1];
        delete ddoc2[2];
        delete ddoc2.signed;   
        return ddoc2;
    }

    it.only('final test', async() => {
        let web3 = new Web3();
        web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
        const address = accounts[0];        
        let pri = '8d22a0aa9c43da157ebc24bc7d70c26d198381e042ab93434757752e3f0ee8e5';
        const wall = new ethers.Wallet(pri);
        let pub_key = wall.publicKey;
        console.log(pub_key);
        let pub = wall.publicKey.substring(4, wall.publicKey.length);

        let ddoc = await obj.createDoc(pub); 
        let ddoc2 = Object.assign({}, ddoc);
        delete ddoc2[0];
        delete ddoc2[1];
        delete ddoc2[2];
        delete ddoc2.signed;
        let docstr = JSON.stringify(ddoc2);

        const hash = web3.utils.keccak256(docstr);
        console.log("hash : ", hash);
        let signature = await web3.eth.sign(docstr, address, function (err, result) { console.log(err, result);});
        let signatureForRegist = await web3.eth.sign(hash, address, function (err, result) { console.log(err, result);});
        const sig = util.fromRpcSig(signatureForRegist);        
        ddoc2.signed = signature;

        let v = util.bufferToHex(sig.v);
        let r = util.bufferToHex(sig.r);
        let s = util.bufferToHex(sig.s);
        console.log("ssssssssssssssssssssssssssssssssssssssssssssssss")
        console.log(hash);
        console.log(v);
        console.log(r);
        console.log(s);
        const recoverAddress = await obj.recoverAdd(hash, v, r, s, {from: accounts[0]});
        console.log("rec : ", recoverAddress);
        console.log("org : ", address);
        console.log(ddoc2);

        await obj.RegisterDid(ddoc2, hash, v, r, s);

        console.log("======= recovering Public key by sign =========");

        let getdoc = await obj.getDdoc(ddoc2.id);
        let Received_ddoc = Object.assign({}, getdoc);
        delete Received_ddoc[0];
        delete Received_ddoc[1];
        delete Received_ddoc[2];

        let getsign = Received_ddoc.signed;
        delete Received_ddoc.signed;
        docstr = JSON.stringify(Received_ddoc);
        
        const digest = arrayify(hashMessage(docstr));
        console.log("hash message : ", hashMessage(docstr));
        console.log("after arrayify : ", digest)
        let publicKey = await recoverPublicKey(digest, signature);

        const pubLength = publicKey.length;
        publicKey = publicKey.substring(4, pubLength);
        console.log("originall key : ", pub);
        console.log("recovered key : ", publicKey);
    })

    it('another function', async() => {
        
        let web3 = new Web3();
        web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
        const address = accounts[0];        
        let pri = '0x8d22a0aa9c43da157ebc24bc7d70c26d198381e042ab93434757752e3f0ee8e5';
        const wall = new ethers.Wallet(pri);
        let pub_key = wall.publicKey;
        console.log(pub_key);
        let pub = wall.publicKey.substring(4, wall.publicKey.length);

        let ddoc = await obj.createDoc(pub); 
        let ddoc2 = prettier(ddoc);
        console.log("ddoc2 $$$$$$$$$$$$$$$$", ddoc2);
        let docstr = JSON.stringify(ddoc2);

        const hash = web3.utils.keccak256(docstr);
        let signature = await web3.eth.sign(docstr, address, function (err, result) { console.log(err, result);});
        let signatureForRegist = await web3.eth.sign(hash, address, function (err, result) { console.log(err, result);});
        const sig = util.fromRpcSig(signatureForRegist);        
        ddoc2.signed = signature;
        
        let myDid = ddoc2.id;

        let v = util.bufferToHex(sig.v);
        let r = util.bufferToHex(sig.r);
        let s = util.bufferToHex(sig.s);
        const recoverAddress = await obj.recoverAdd(hash, v, r, s, {from: accounts[0]});
        console.log("rec : ", recoverAddress);
        console.log("org : ", address);
        console.log(ddoc2);

        let isRegist1 = await obj.RegisterDid(ddoc2, hash, v, r, s);
        console.log(isRegist1);
        let isRegist2 = await obj.getDdoc("0x234n24tj").then(console.log);
        console.log(prettier(Object.assign({}, isRegist2)));
    });
/*
    it('recover address from sign', async() => {
        let web3 = new Web3();
        web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
        //const hash = web3.utils.sha3('hello');
        const hash = web3.utils.keccak256('hello');
        const address = accounts[1];
        let signature = await web3.eth.sign(hash, address, function (err, result) { console.log(err, result);});
        let signatureData = util.fromRpcSig(signature);
        let v = util.bufferToHex(signatureData.v);
        let r = util.bufferToHex(signatureData.r);
        let s = util.bufferToHex(signatureData.s);
        console.log("v - ", v);
        const recoverAddress = await obj.recoverAdd(hash, v, r, s, {from: accounts[0]});

        console.log("verifying signed message");
        console.log("recover address - ",recoverAddress);
        console.log("Origin  Address - ", address);
        assert.equal(recoverAddress, address);
    })


    it('recovering public key from sign', async() => {
        let web3 = new Web3();
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
        const signer = await provider.getSigner()
        console.log("사인하는 어카운트 : ", signer);

        let pri = '0x8d22a0aa9c43da157ebc24bc7d70c26d198381e042ab93434757752e3f0ee8e5';
        const wall = new ethers.Wallet(pri);
        let pub = wall.publicKey.substring(4, wall.publicKey.length);
        
        let ddoc = await obj.createDoc(pub); 
        let ddoc2 = Object.assign({}, ddoc);
        delete ddoc2[0];
        delete ddoc2[1];
        delete ddoc2[2];
        delete ddoc2.signed;
        let docstr = JSON.stringify(ddoc2);

        const hash = web3.utils.keccak256(docstr);
        const signature_key = await signer.signMessage(docstr);
        ddoc2.signed = signature_key;
        const sig = util.fromRpcSig(signature_key);
        let v = util.bufferToHex(sig.v);
        let r = util.bufferToHex(sig.r);
        let s = util.bufferToHex(sig.s);
        const recoverAddress = await obj.recoverAdd(hash, v, r, s);
        console.log("rec : ", recoverAddress);
        let isRegist = await obj.RegisterDid(ddoc2, hash, v, r, s);

        
        console.log("======= recovering Public key by sign =========");
        let Received_ddoc = ddoc2;
        let Received_sign = Received_ddoc.signed;
        delete Received_ddoc.signed;
        docstr = JSON.stringify(Received_ddoc);
        console.log("after stringify : ", docstr);

        const digest = arrayify(hashMessage(docstr));
        let publicKey = await recoverPublicKey(digest, Received_sign);
        const pubLength = publicKey.length;
        publicKey = publicKey.substring(4, pubLength);
        console.log("recovered key : ", publicKey);
        console.log("original key  : ", Received_ddoc.public_key);
    })
*/
})