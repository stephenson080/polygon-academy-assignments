import { Modal, Form, Container, Icon, Button } from "semantic-ui-react";
import { useState,useRef } from "react";
import { toast, TypeOptions } from 'react-toastify';
import {v4 as uuid} from  'uuid'

import fleek from '@fleekhq/fleek-storage-js';

import contract from "../blockchain/media-contract";
import { providers } from "ethers";


type Props = {
  showModal: boolean;
  currentAddress: string;
  provider: providers.Web3Provider;
  closeModal: () => void;
};
interface UIState {
  titleError: boolean;
  loading: boolean;
  imageError: boolean;
  uploadingFile: boolean
}
interface State {
  title: string;
  imageHash: string;
}
export default function AddPost({
  showModal,
  currentAddress,
  closeModal,
  provider,
}: Props) {
  const [uiState, setUistate] = useState<UIState>({
    loading: false,
    imageError: false,
    titleError: false,
    uploadingFile: false
  });
  const [state, setState] = useState<State>({
    title: "",
    imageHash: "",
  });
  const toastRef = useRef<any>(null)

  function showToast(message: string, type?: TypeOptions, isLoading?: boolean ){
    if (!toastRef.current){
      toastRef.current = toast(message, { isLoading, type, autoClose: false  })
      return
    }
    
    const newId = uuid()
    toast.update(toastRef.current, { type, autoClose: 5000, isLoading, render: message, toastId: newId})
    toastRef.current = newId
  }

  async function addPost(){
    try {
      if (!state.imageHash){
        setUistate({...uiState, imageError: true})
        return
      }
      if (!state.title){
        setUistate({...uiState, titleError: true})
        return
      }
      setUistate({...uiState, loading: true})
      const signer = provider.getSigner(currentAddress)
      await contract.addNewPost(state.title, state.imageHash, signer)
      showToast('Transaction Success! Your post is being uploaded', 'success', false)
      setUistate({...uiState, loading: false})
    } catch (error : any) {
      showToast(JSON.parse(JSON.stringify(error.message)),'error', false)
    }
  }

  return (
    <Modal size="small" dimmer open={showModal}>
      <Modal.Header style={{ backgroundColor: "purple", color: "white" }}>
        {" "}
        <Icon
          loading={uiState.loading}
          name={uiState.loading ? "asterisk" : "add circle"}
        />{" "}
        {uiState.loading
          ? "Processing Transaction... Please Wait!"
          : `Post an Image`}
      </Modal.Header>
      <Modal.Content>
        <Container>
          <h5 style={{ marginLeft: "28px" }}>
            Fill in the Form to post an image
          </h5>
          <Form
            style={{ marginTop: "55px", marginLeft: "28px" }}
            loading={uiState.loading}
            // error={uiState.error}
          >
            <Form.Input
              error={uiState.titleError}
              type="text"
              style={{ width: "100%" }}
              label="Post Title"
              size="big"
              placeholder="enter post title"
              value={state.title}
              onBlur={()=> {
                if (!state.title){
                  setUistate({...uiState, titleError: true})
                  return 
                }
                setUistate({...uiState, titleError: false})
              }}
              onChange={(e) => {
                setState({
                  ...state,
                  title: e.target.value,
                });
              }}
            />
            <Form.Input
              error={uiState.imageError}
              required
              loading={uiState.uploadingFile}
              type="file"
              style={{ width: "100%" }}
              label="Image"
              size="big"
              placeholder="upload you image"
              onChange={async (e) => {
                try {
                  if (!e.target.files) {
                  
                    return;
                  }
                  if (e.target.files.length <= 0) {
                    return;
                  }
                  const file = e.target.files[0];
                  const input = {
                    apiKey: process.env.REACT_APP_API_KEY!,
                    apiSecret: process.env.REACT_APP_API_SECRET!,
                    key: `my-folder/${file.name}`,
                    data: file,
                  };
                  setUistate({...uiState, uploadingFile: true})
                  const uploadFile = await fleek.upload(input)
                  setState({...state, imageHash: uploadFile.hash})
                  setUistate({...uiState, imageError: false, uploadingFile: false})
                }catch(err: any){
                  showToast(err.message, 'error', false)
                  setUistate({...uiState, imageError: true, uploadingFile: false})
                }
                
              }}
            />
          </Form>
        </Container>
      </Modal.Content>
      <Modal.Actions>
        <Button
          disabled={uiState.loading || uiState.uploadingFile ? true : false}
          negative
          onClick={() => {
            setState({title: '', imageHash: ''})
            closeModal()
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={uiState.loading || uiState.uploadingFile ? true : false}
          positive
          onClick={addPost}
        >
          Post
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
