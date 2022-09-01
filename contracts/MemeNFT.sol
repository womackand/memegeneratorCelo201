// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MemeNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 private MintFee;

    modifier checkAddress(address _address) {
        require(
            _address != address(0),
            "Error: Zero address is not a valid address"
        );
        _;
    }

    constructor(uint256 _mintFee) ERC721("MemeNFT", "MNFT") {
        MintFee = _mintFee * 1 ether;
    }

    // Mapping to keep track of tokenID and their owners
    mapping(address => uint256[]) private nftTracker;

    /// @dev mints an NFT
    /// @notice Users pay a mint fee in CELO to be able to mint a token
    function safeMint(address to, string calldata uri)
        public
        payable
        checkAddress(to)
    {
        require(MintFee == msg.value, "Celo supplied not up to minting fee");
        require(bytes(uri).length > 0, "Empty uri");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _keepTrack(msg.sender, tokenId);

        // transfer fees
        (bool success, ) = payable(owner()).call{value: msg.value}("");
        require(success, "Transfer of fee failed");
    }

    /// @dev Send meme to friends
    function sendMeme(address to, uint256 tokenId) public checkAddress(to) {
        require(_exists(tokenId), "Query of nonexistent meme");
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "Error: Not owner/operator"
        );
        _transfer(msg.sender, to, tokenId);
        _keepTrack(to, tokenId);
    }

    /// @dev   Get user meme mapping
    function getUserMemeIds(address _user)
        public
        view
        checkAddress(_user)
        returns (uint256[] memory)
    {
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

    /// @dev Keep Track of Minted NFTS and their owners
    function _keepTrack(address _address, uint256 _id) private {
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

    /**
     * @dev See {IERC721-transferFrom}.
     * Changes is made to transferFrom to update state for mapping nftTracker
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        _keepTrack(to, tokenId);
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     * Changes is made to safeTransferFrom to update state for mapping nftTracker
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        _keepTrack(to, tokenId);
        _safeTransfer(from, to, tokenId, data);
    }

    // Fallback: reverts if Celo is sent to this smart-contract by mistake
    fallback() external {
        revert();
    }
}
