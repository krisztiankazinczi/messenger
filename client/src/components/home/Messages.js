import React, { Fragment, useEffect } from 'react';
import { gql, useLazyQuery , useMutation} from '@apollo/client'
import { Col, Form } from 'react-bootstrap';

import Message from './Message';
import useForm from '../../utils/useForm';

import { useMessageDispatch, useMessageState } from '../../context/message';


const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

export default function Messages() {
  const { users } = useMessageState();
  const dispatch = useMessageDispatch();
  const selectedUser = users?.find(user => user.selected === true);
  const messages = selectedUser?.messages;
  const { values, updateValue, updateValueOutsideEvent } = useForm({
    content: ''
  });

  const [getMessages, { loading: messagesLoading, data: messagesData }] = useLazyQuery(GET_MESSAGES);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: data => dispatch({ type: 'ADD_MESSAGE', payload: {
      username: selectedUser.username,
      message: data.sendMessage
    }}),
    onError: err => console.log(err)
  })

  useEffect(() => {
    // if messages are here, we don't need to fetch them again
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } })
    }
  }, [selectedUser]);

  useEffect(() => {
    // if the first useEffect runs, because those messagees were not fetched till now, it will run too
    if (messagesData) {
      dispatch({ type: 'SET_USER_MESSAGES', payload : { 
        username: selectedUser.username,
        messages: messagesData.getMessages
       } })
    }
  }, [messagesData]);

  const submitMessage = e => {
    e.preventDefault();
    
    if (values.content.trim() === '' || !selectedUser) return
    updateValueOutsideEvent('content', '')

    // mutation to send the message
    sendMessage({ variables: { to: selectedUser.username, content: values.content } })
  }

  let selectedChatMarkup;
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p className="info-text">Select a friend</p>
  } else if (messagesLoading) {
    selectedChatMarkup = <p className="info-text">Loading...</p>
  } else if (messages.length) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {/* this needs because the margin of the top element near nav bar collapse */}
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ))
  } else if (messages.length === 0) {
    selectedChatMarkup = <p className="info-text">You are now connected! Send your first message!</p>
  }

  return (
    <Col xs={10} md={8}>
      <div  className="messages-box d-flex flex-column-reverse">
        {selectedChatMarkup}
      </div>
      <div>
        {selectedUser && (
          <Form onSubmit={submitMessage}>
            <Form.Group className="d-flex align-items-center">
              <Form.Control
                type="text"
                className="message-input p-4 rounded-pill bg-secondary border-0"
                placeholder="Type a message..."
                value={values.content}
                name="content"
                onChange={updateValue}
              />
              <div className="ml-2" onClick={submitMessage}>
                <i
                  className="fas fa-paper-plane fa-2x text-primary"
                  role="button"
                ></i>
              </div>
            </Form.Group>
          </Form>
        )}
      </div>
    </Col>
  )
}
