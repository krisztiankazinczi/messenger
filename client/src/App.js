import React from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Switch } from 'react-router-dom';

import ApolloProvider from './providers/ApolloProvider';

import './App.scss';
import Register from './pages/register';
import Login from './pages/login';
import Home from './pages/home';

import { AuthProvider } from './context/auth';
import { MessageProvider } from './context/message';
import DynamicRoute from './components/DynamicRoute';


function App() {


  return (
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Container className="pt-5">
              <Switch>
                <DynamicRoute path="/register" component={Register} guest />
                <DynamicRoute path="/login" component={Login} guest />
                <DynamicRoute exact path="/" component={Home} authenticated />
              </Switch>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
