import { providers, utils, Contract } from "ethers";
import { v4 as uuid } from "uuid";
import SocialMediaJson from "../contracts/social-media.sol/SocialMedia.json";

export interface Post {
  imageHash: string;
  likes: number;
  title: string;
  isActive: boolean;
  owner: string;
  id: string;
  time: Date;
}

class MediaContract {
  contract;
  posts: Post[] = [];
  constructor() {
    const provider = new providers.Web3Provider(window.ethereum!);
    this.contract = new Contract(
      "0xd485E52CC0B483ECf4255420a640a4a439a0186E",
      SocialMediaJson.abi,
      provider
    );
  }

  async addNewPost(
    title: string,
    imageHash: string,
    signer: providers.JsonRpcSigner
  ) {
    const _id = uuid();
    const date = new Date().toLocaleString();
    const { hash } = await this.contract
      .connect(signer)
      .addPost(title, imageHash, date, _id);
    let trans: string[] = [];
    const existingTrx = localStorage.getItem("trxs");
    if (existingTrx) {
      trans = JSON.parse(existingTrx);
    }
    trans.push(hash);
    localStorage.setItem("trxs", JSON.stringify(trans));
  }

  async getAllPost() {
    const allPosts = await this.contract.getAllPosts();
    const fetchedPosts = [];
    for (let p of allPosts) {
      const post: Post = {
        id: p.id,
        imageHash: p.imageHash,
        isActive: p.isActive,
        likes: +utils.formatEther(p.likes) * Math.pow(10, 18),
        owner: p.owner,
        title: p.title,
        time: new Date(p.time),
      };
      fetchedPosts.push(post);
    }
    this.posts = [...fetchedPosts];
    return this.posts;
  }
  async likePost(id: string, signer: providers.JsonRpcSigner) {
    const { hash } = await this.contract.connect(signer).likePost(id);
    let trans: string[] = [];
    const existingTrx = localStorage.getItem("trxs");
    if (existingTrx) {
      trans = JSON.parse(existingTrx);
    }
    trans.push(hash);
    localStorage.setItem("trxs", JSON.stringify(trans));
  }
}

export default new MediaContract();
