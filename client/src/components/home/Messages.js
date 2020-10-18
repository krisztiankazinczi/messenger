import React, { Fragment, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client'
import { Col } from 'react-bootstrap';

import Message from './Message';

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

export default function Messages() {
  const { users } = useMessageState();
  const dispatch = useMessageDispatch();
  const selectedUser = users?.find(user => user.selected === true);
  const messages = selectedUser?.messages;

  const [getMessages, { loading: messagesLoading, data: messagesData }] = useLazyQuery(GET_MESSAGES);

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

  let selectedChatMarkup;
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p>Select a friend</p>
  } else if (messagesLoading) {
    selectedChatMarkup = <p>Loading...</p>
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
    selectedChatMarkup = <p>You are now connected! Send your first message!</p>
  }

  return (
    <Col xs={10} md={8} className="messages-box d-flex flex-column-reverse">
      {selectedChatMarkup}
    </Col>
  )
}
