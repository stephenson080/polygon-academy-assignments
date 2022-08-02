import { Card, Icon, Image } from 'semantic-ui-react'
import {Post} from '../blockchain/media-contract'

type Props =  {
    post: Post,
    likePost: (id: string)=> void
}
const PostCard = (props: Props) => (
  <Card fluid>
    <Image src={`https://${props.post.imageHash}.ipfs.infura-ipfs.io/`} wrapped ui={false} />
    <Card.Content>
      <Card.Header>{props.post.title}</Card.Header>
      <Card.Meta>
        <span className='date'>{props.post.time.toLocaleString()}</span>
      </Card.Meta>
      <Card.Description>
        Owner: {props.post.owner}
      </Card.Description>
    </Card.Content>
    <Card.Content extra>
      <a onClick={() => {
          props.likePost(props.post.id)
      }}>
        Likes
        <Icon name='heart outline' />
        {props.post.likes}
      </a>
    </Card.Content>
  </Card>
)

export default PostCard