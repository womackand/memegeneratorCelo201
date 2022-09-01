// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MemeNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 MintFee;

    constructor(uint256 _mintFee, uint256 _decimals) ERC721("MemeNFT", "MNFT") {
        uint256 decimals = 10**_decimals;
        MintFee = (_mintFee * 1 ether) / decimals;
    }

    // Mapping to keep track of tokenID and their owners
    mapping(address => uint256[]) private nftTracker;

    //    mint an NFT
    //    Users pay a mint fee in cUSD to be able to mint a token
    function safeMint(address to, string memory uri) public payable {
        require(MintFee == msg.value, "Celo supplied not up to minting fee");

        // transfer fees
        (bool success, ) = payable(owner()).call{value: msg.value}("");
        require(success, "Transfer of fee failed");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _keepTrack(msg.sender, tokenId);
    }

    //    Send meme to friends
    function sendMeme(address to, uint256 tokenId) public {
        _transfer(msg.sender, to, tokenId);
        _keepTrack(to, tokenId);
    }

    //   Get user meme mapping
    function getUserMemeIds(address _user)
        public
        view
        returns (uint256[] memory)
    {
        require(_user != address(0), "Invalid address");
        uint256[] memory userMemes = new uint256[](balanceOf(_user));
        uint256 index = 0;
        for (uint256 i = 0; i < nftTracker[_user].length; i++) {
            uint256 memeId = nftTracker[_user][i];
            if (ownerOf(memeId) == _user) {
                userMemes[index] = nftTracker[_user][i];
                index++;
            }
        }
        return userMemes;
    }

    function getMintFee() public view returns (uint256) {
        return MintFee;
    }

    //    Keep Track of Minted NFTS and their owners
    function _keepTrack(address _address, uint256 _id) internal {
        nftTracker[_address].push(_id);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    //    destroy an NFT
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    //    return IPFS url of NFT metadata
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Fallback: reverts if Celo is sent to this smart-contract by mistake
    fallback() external {
        revert();
    }
}
