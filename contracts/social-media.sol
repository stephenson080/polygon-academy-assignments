// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
pragma experimental ABIEncoderV2;

contract SocialMedia {
    Post[] allPosts;
    struct Post {
        address owner;
        string imageHash;
        string id;
        uint likes;
        string title;
        bool isActive;
        string time;
    }

    event PostAdd(address owner, Post post);

    constructor() {}

    function addPost(string calldata _title, string calldata _imageHash, string calldata date_time, string calldata _id)
        public
    {
        // Make sure the video hash exists
        require(bytes(_imageHash).length > 0, 'Image does not exist');
        // Make sure video title exists
        require(bytes(_title).length > 0, "title does not exist");

        Post storage post = allPosts.push();
        post.id =  _id;
        post.imageHash = _imageHash;
        post.likes = 0;
        post.owner = msg.sender;
        post.title =_title;
        post.time = date_time;
        post.isActive = true;
        emit PostAdd(post.owner, post);
    }

    function likePost(string memory _id) public {
        for (uint i=0; i<allPosts.length; i++){
            string memory id = allPosts[i].id;
            if (keccak256(abi.encodePacked((id))) == keccak256(abi.encodePacked((_id)))){
                allPosts[i].likes++;
                break;
            }
        }
    }

    function getAllPosts() public view returns (Post[] memory) {
        return allPosts;
    }

}
