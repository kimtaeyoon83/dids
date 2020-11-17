pragma solidity >=0.4.22 <0.8.0;
pragma experimental ABIEncoderV2;

contract dids {
    address public owner;

    struct did_document {
        string id;
        string public_key;
        string signed;
    }

    mapping(address => string) private _addressToDid;
    mapping(string => did_document) private _didToDdoc;
    mapping(string => string) private _ddocToPubkey;
    mapping(string => uint8) private _isvalidDid;

    constructor() public {
        owner = msg.sender;
    }

    modifier _isSigner(address add) {
        if (msg.sender == add) _;
    }

    //for test function
    function myadd() public view returns (address myAddr) {
        return msg.sender;
    }

    //create dids id
    function createId() public view returns (string memory id) {
        string memory id1 = "did:ethr:";
        string memory id2 = toString(abi.encodePacked(msg.sender));
        return string(abi.encodePacked(id1, id2));
    }

    function getMyaddress() public view returns (string memory id) {
        return toString(abi.encodePacked(msg.sender));
    }

    function toString(address account) public pure returns (string memory) {
        return toString(abi.encodePacked(account));
    }

    function toString(uint256 value) public pure returns (string memory) {
        return toString(abi.encodePacked(value));
    }

    function toString(bytes32 value) public pure returns (string memory) {
        return toString(abi.encodePacked(value));
    }

    function toString(bytes memory data) public pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint256(uint8(data[i] >> 4))];
            str[3 + i * 2] = alphabet[uint256(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }

    //create document call above function inside this func
    function createDoc(string memory pub)
        public
        view
        returns (did_document memory dd)
    {
        dd.id = createId();
        dd.public_key = pub;
        return dd;
    }

    string id;
    string public_key;
    uint256 signed;

    function recoverAdd(
        bytes memory msgHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        //bytes memory pre_msg = prefix ^ msgHash;
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, msgHash));
        //get an address
        return ecrecover(prefixedHash, v, r, s);
    }

    function verify(
        address addr,
        bytes memory msgHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (bool) {
        return addr == recoverAdd(msgHash, v, r, s);
    }

    // mapping(address => string) private _addressToDid;
    // mapping(string => did_document) private _didToDdoc;
    // mapping(string => string) private _ddocToPubkey;
    //mapping(string => uint8) private _isValidDid;
    function RegisterDid(
        did_document memory dDoc,
        bytes memory hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public returns (bool _isRegist) {
        require(
            msg.sender == recoverAdd(hash, v, r, s),
            "not signer. invalid user"
        );
        bytes memory isEmpty = bytes(_addressToDid[msg.sender]); // Uses memory
        require(isEmpty.length > 3, "your account already have a did.");
        require(_isvalidDid[dDoc.id] == 0, "There is already same did");

        string memory getid = dDoc.id;
        _addressToDid[msg.sender] = getid;
        _didToDdoc[getid] = dDoc;
        _isvalidDid[getid] = 1;

        return true;
    }

    function getDdoc(string memory did)
        public
        view
        returns (did_document memory)
    {
        require(_isvalidDid[did] == 1, "invalid did!");
        return _didToDdoc[did];
    }

    function deleteDid(
        string memory did,
        bytes memory hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public returns (bool _isChanged) {
        require(
            msg.sender == recoverAdd(hash, v, r, s),
            "not signer. invalid user"
        );
        //did 이미 있는건지 확인
        bytes memory isEmpty = bytes(_addressToDid[msg.sender]); // Uses memory
        require(isEmpty.length > 3, "your account doesn't have any did.");

        require(
            keccak256(abi.encodePacked(_addressToDid[msg.sender])) !=
                keccak256(abi.encodePacked(did))
        );
        _isvalidDid[did] = 0;
        _addressToDid[msg.sender] = "x";

        return true;
    }

    // * @dev did document 내용을 수정하기 위한 함수. 공개키가 하나이고 did 값도 주소값이므로
    // 이 함수는 필요하지 않아서 틀만 놔둠. => 만약 공개키나 sign 값을 잘못 설정한 경우.
    // * @param did document
    // * @return 함수가 잘 수행 됐는지 확인
    function updateDdoc(
        did_document memory dDoc,
        bytes memory hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public returns (bool) {
        require(
            msg.sender == recoverAdd(hash, v, r, s),
            "not signer. invalid user"
        );
        //did 이미 있는건지 확인
        bytes memory isEmpty = bytes(_addressToDid[msg.sender]); // Uses memory
        require(isEmpty.length != 0, "your account doesn't have any did.");
        require(
            keccak256(abi.encodePacked(_addressToDid[msg.sender])) !=
                keccak256(abi.encodePacked(dDoc.id))
        );
        _addressToDid[msg.sender] = dDoc.id;
        _didToDdoc[dDoc.id] = dDoc;
        return true;
    }
}
