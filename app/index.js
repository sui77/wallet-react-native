import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import AppNavigator from './routes/stackNavigator';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );
  }
}

export default App;
